import { For, Component, createEffect, Show, onMount, } from "solid-js";
import { createSignal } from "solid-js";
import { Trans, useTransContext } from "@mbarzda/solid-i18next"

import Typewriter from 'typewriter-effect/dist/core.js';
import Header from "./lobby/Header";
import JoinOrCreateLobby from "./JoinOrCreateLobby";
import SetUsername from "./SetUsername";
import Lobby, { setGoToLobby } from "./lobby/Lobby";
import { TLobby, TWiki, TPlayer } from "./types";
import { addRandomArticles } from "./RandomArticle";

import PlayerList from "./lobby/PlayerList";
import { updateWiki } from "./lobby/Wiki";
import { setLanguage } from "./language";

let [connected, setConnection] = createSignal<boolean>(false);
let [hasUsername, setHasUsername] = createSignal<boolean>(false);
let ws: WebSocket | null = null;

let oldConnections: Set<WebSocket> = new Set()
let ping = Infinity;

let passwordSend = false;
let missedMessages: string[] = [];
export function sendMessage(msg: any, http = true) {
  if (http) {
    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    msg.password = localStorage.getItem("private_key");

    var requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(msg),
      redirect: 'follow'
    };

    const url = (import.meta.env.VITE_tls === "true" ? "https://" : "http://") + import.meta.env.VITE_backend_url + ":" + import.meta.env.VITE_port
    fetch(url + `/message/${id}`, requestOptions)
      .then(response => response.text())
    return
  }
  if (ws && passwordSend) {
    try {
      ws.send(JSON.stringify(msg));
    } catch (e) {
      console.error(e);
      try {
        ws?.close()
      } catch {
        console.log("websocket already in closed state")
      }
      missedMessages.push(JSON.stringify(msg));
    }
  } else {
    missedMessages.push(JSON.stringify(msg));
    console.warn("websocket not connected");
  }
}

// let [players, setPlayers = createSignal([])

let id = localStorage.getItem("id");
let password = localStorage.getItem("private_key");
let [wiki, setWiki] = createSignal<TWiki>();

let setUsernameMsg = {
  type: "player",
  method: "set_user_name",
  args: { name: "Gast" },
};

if (!id) {
  id = self.crypto.randomUUID();
  localStorage.setItem("id", id);
}

if (!password) {
  password = self.crypto.randomUUID();
  localStorage.setItem("private_key", password);
}

const [search, setSearch] = createSignal([]);

export const startWS = () => {
  const url = (import.meta.env.VITE_tls === "true" ? "wss://" : "ws://") + import.meta.env.VITE_backend_url + ":" + import.meta.env.VITE_port
  console.log(url)
  ws = new WebSocket(url + `/ws/${id}`);

  oldConnections.add(ws)

  ws.onopen = (_) => {
    ping = Date.now()
    ws?.send(password)
  };
  ws.onerror = function(err) {
    console.error("Socket encountered error: ", err, "Closing socket");
    ws?.close();
  };
  ws.onclose = function(e) {
    console.log(
      "Socket is closed",
      e.reason
    );
    setConnection(false);
  };

  ws.onmessage = (e) => {
    if (e.data === "password") {

      passwordSend = true;
      setConnection(true);
      let username = localStorage.getItem("username");
      if (username) {
        let msg = setUsernameMsg;
        setUsernameMsg.args.name = username;
        sendMessage(msg);
        setHasUsername(true);
      }
      // joining lobby if you were in a lobby before
      const urlSearchParams = new URLSearchParams(window.location.search);
      if (urlSearchParams.get("code")) {
        let joinLobbyMsg = {
          type: "lobby",
          method: "join_lobby",
          args: { id: urlSearchParams.get("code") },
        };
        sendMessage(joinLobbyMsg);
      }
      missedMessages.forEach((msg) => {
        ws?.send(msg);
      });
      missedMessages = [];
      return
    }
    if (e.data === "ping") {
      // time now in unixtimestamp
      ping = Date.now();
      if (ws?.readyState === 1) {
        // TODO: not sure if needed
        // needs to be implemented in the future in Backend
        // ws?.send("pong");
      }
      return
    }
    let data = JSON.parse(e.data);
    if (data.method === "LobbyUpdate") {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("code", data.id);
      window.history.pushState(null, "", "?" + urlParams.toString());

      console.log(data);
      if (data?.state == "over") {
        setGoToLobby(false);
      }
      setPlayers(data.players);
      setLobby(data);
    } else if (data.method === "Wiki" && !Array.isArray(data.data)) {
      setWiki(data.data);
      window.scrollTo(0, 0);
      console.log(data);
      // search -> maybe add a method on backend
    } else if (data.method === "Random") {
      addRandomArticles(data.data);
    } else if (data.method === "LobbyNotFound") {
      setLobby(null);
    } else if (data.method === "SyncMove") {
      updateWiki(data.url_name, lobby()?.language);
    } else if (typeof data.data === "object") {
      console.log(data.data);
      if (!data.data.error) {
        setSearch(data.data);
      }
    } else {
      console.log(e);
    }
  };
};

const [lobby, setLobby] = createSignal<TLobby | null>(null);
const [players, setPlayers] = createSignal<TPlayer[] | null>(null);


const [code, setCode] = createSignal<bool>(false);

if (localStorage.getItem("username")) {
  startWS();
  setInterval(() => {
    // 1 = conection open
    if ((ws?.readyState !== 0) && (Date.now() - ping) > 5000) {
      oldConnections.forEach(() => {
        ws?.close()
        console.log("test")
      })
      oldConnections.clear()
      passwordSend == false
      console.warn("timeout closing connection")
    }
    if (ws?.readyState === 3) {
      console.info("starting new connection")
      startWS();
    }

  }, 2000)
}

const App: Component = () => {

  const [t, { changeLanguage }] = useTransContext();
  const [impressum, setImpressum] = createSignal(false)
  onMount(() => {
    if (!localStorage.getItem("lng")) {
      changeLanguage(navigator.language)
    } else {
      changeLanguage(localStorage.getItem("lng"))
      const node = document.getElementById("slogan")
      new Typewriter(node, {
        strings: [t("home.slogan")],
        loop: false,
        autoStart: true
      }).callFunction((node) => {
        node.elements.container.remove()
        console.log(node)
        console.log("test")
      })
    }
  })
  return (
    <div class="flex items-stretch min-h-screen bg-base-200">
      <Show when={lobby()?.state === "ingame"}>
        <div class="hidden lg:flex">
          <aside class="p-3 grow flex flex-col justify-start max-h-screen w-48 m-3 mr-0 bg-base-100 shadow-md rounded-md sticky top-3">
            <div class="font-medium mb-3">
              <h3><Trans key="players" />:</h3>
            </div>
            <PlayerList
              players={players}
              pointsKey="points_current_round"
            />
          </aside>
        </div>
      </Show>
      <div class="w-full">
        <Show when={lobby() && hasUsername()}>
          <Header lobby={lobby} id={id} />
        </Show>

        <Show when={!impressum()}>
          <Show when={lobby()}>
            <div class="px-4">
              <Lobby players={players} wiki={wiki} id={id} lobby={lobby} search={search} />
            </div>
          </Show>
          <Show when={!lobby()}>
            <div class="flex flex-col items-center">
              <div
                class="hero min-h-screen bg-base-200 object-cover"
                style="background-image: url(triangles-download (1).png);"
              >
                <div class="hero-content text-center flex flex-col">
                  <div class="max-w-xl">
                    <div class="w-full flex justify-center ">
                      <img class="w-32 m-8" src="/logo.svg" />
                    </div>
                    <h1 class="text-5xl font-bold">
                      <Trans key="home.title" />
                    </h1>
                    <p class="py-6" id="slogan">
                      <Trans key="home.slogan" />
                    </p>
                  </div>
                  <Show when={!hasUsername()}>
                    <SetUsername setHasUsername={setHasUsername} />
                  </Show>
                  <Show when={hasUsername()}>
                    <Show when={!lobby() && hasUsername()}>
                      <JoinOrCreateLobby />
                    </Show>
                  </Show>
                </div>
              </div>
            </div>
            <div class="flex justify-center w-full text-center cursor-pointer font-medium text-sm" onClick={() => setImpressum(!impressum())}>
              <div><span>Impressum und Datenschutzerklärung</span></div>
            </div>
          </Show>
        </Show>
        <Show when={impressum()}>

          <Impressum />
          <div class="flex justify-center w-full text-center cursor-pointer" onClick={() => setImpressum(!impressum())}>
            <div class="font-bold"><span>back to game</span></div>
          </div>
        </Show >

      </div>
    </div>
  );
};

const Impressum: Component = () => {
  return (
    <div class="m-5" ><div><strong>Sören Michaels</strong><div>Zeppelinstraße 45<br />13583 Berlin</div><h1 class="text-xl font-bold">Datenschutzerklärung</h1></div><p>Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2003). In diesen Datenschutzinformationen informieren wir Sie über die wichtigsten Aspekte der Datenverarbeitung im Rahmen unserer Website.</p><h2>Verantwortlicher</h2><p>Verantwortlicher für die Datenverarbeitung ist die Person Sören Michaels mit Sitz in Zeppelinstraße 45, 13583 Berlin. Sie erreichen uns telefonisch unter 015227392811, per Mail unter soeren.michaels+wikiparty@gmail.com oder postalisch unter der Anschrift Zeppelinstraße 45, 13583 Berlin.</p><h2>Datensicherheit</h2><p>Wir treffen nach Maß des Art 32 DSGVO entsprechende Vorkehrungen zum Schutz Ihrer personenbezogenen Daten. Diese betreffen insbesondere den Schutz vor unerlaubtem, rechtswidrigem oder auch zufälligem Zugriff, Verarbeitung, Verlust, Verwendung und Manipulation.</p><h2>Webseite</h2><h3>Personenbezogene Daten, Zweck der Datenverarbeitung und Rechtsgrundlage</h3><p>Personenbezogene Daten sind Angaben, die eindeutig einer Person zugeordnet werden können. Dazu gehören unter anderem Angaben wie vollständiger Name, Anschrift, E-Mail und Telefonnummer. Bei einem Besuch unserer Website werden aus technischen Gründen automatisch weitere Daten erfasst (IP-Adresse, Beginn und Ende der Sitzung, Datum und Uhrzeit der Anfrage, angesteuerte Unterseite auf unserer Webseite, Art und Version des br/owsers, Betriebssystem, Referrer URL). Diese technischen Informationen können im Einzelfall personenbezogene Daten sein. Im Regelfall verwenden wir diese technischen Informationen nur, wenn dies (aus technischen Gründen) für den Betrieb und Schutz unserer Website vor Angriffen und Missbr/auch erforderlich ist sowie pseudonymisiert oder anonymisiert für statistische Zwecke.</p><p>Wenn Sie per Anfrageformular auf der Website oder per E-Mail Kontakt mit uns aufnehmen, werden Ihre angegebenen Daten (Vorname, Nachname, Adresse, Telefonnummer, E-Mail) zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen sechs Monate bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Eine Verarbeitung Ihrer personenbezogenen Daten für bestimmte Zwecke (z. B. Nutzung Ihrer E-Mail für Newsletter, Werbung) kann auch aufgrund Ihrer Einwilligung erfolgen. Sie können Ihre Einwilligung mit Wirkung für die Zukunft jederzeit widerrufen. Dies gilt auch für den Widerruf von Einwilligungserklärungen, die vor der Geltung der DSGVO, uns gegenüber erteilt worden sind. Über die Zwecke und über die Konsequenzen eines Widerrufs oder der Nichterteilung einer Einwilligung werden Sie gesondert im entsprechenden Text der Einwilligung informiert.</p><p>Zur Erfüllung von Verträgen bzw. vorvertragliche Maßnahmen und darüber hinaus verarbeiten wir Ihre Daten (Vorname, Nachname, Adresse, Telefonnummer, E-Mail) gegebenenfalls, wenn es erforderlich ist, um berechtigte Interessen von uns oder Dritten zu wahren, insbesondere für folgende Zwecke:</p><ul><li>Beantwortung von Anfragen</li><li>Technische Administration</li><li>der Werbung oder Markt- und Meinungsforschung, soweit Sie der Nutzung Ihrer Daten nicht widersprochen haben</li><li>der Prüfung und Optimierung von Verfahren zur Bedarfsanalyse</li><li>der Weiterentwicklung von Dienstleistungen und Produkten sowie bestehenden Systemen und Prozessen</li><li>statistischer Auswertungen oder der Marktanalyse</li><li>der Geltendmachung rechtlicher Ansprüche &amp; Verteidigung bei rechtlichen Streitigkeiten, die nicht unmittelbar dem Vertragsverhältnis zuzuordnen sind</li><li>der Verhinderung und Aufklärung von Straftaten, soweit nicht ausschließlich zur Erfüllung gesetzlicher Vorgaben</li></ul><p>Die Rechtsgrundlagen der Datenverarbeitung sind:</p><ul><li>Vertragsabwicklung gemäß Art 6 Abs 1 lit b DSGVO</li><li>Ihre allfällige Einwilligung gemäß Art 6 Abs 1 lit a DSGVO</li><li>berechtigtes Interesse Art 6 Abs 1 lit f DSGVO</li></ul><h3>Speicherdauer</h3><p>Die Löschung der gespeicherten personenbezogenen Daten erfolgt, wenn Sie als Nutzer unserer Website und/oder Kunde die Einwilligung zur Speicherung widerrufen, wenn Ihre Daten zur Erfüllung des mit der Speicherung verfolgten Zwecks nicht mehr erforderlich sind und nach Ablauf der gesetzlichen Aufbewahrungspflichten bzw. nach Ablauf der Dauer allfälliger darüber hinaus andauernden Rechtsstreitigkeiten oder wenn Ihre Speicherung aus sonstigen gesetzlichen Gründen unzulässig ist bzw. wird.</p><h3>Weitergabe von Daten / Empfänger bzw. Kategorien von Empfängern</h3><p>Eine Weitergabe Ihrer Daten an externe Stellen erfolgt ausschließlich im Zusammenhang mit der Vertragsabwicklung, zu Zwecken der Erfüllung gesetzlicher Vorgaben, nach denen wir zur Auskunft, Meldung oder Weitergabe von Daten verpflichtet sind oder sofern die Datenweitergabe im öffentlichen Interesse liegt oder Sie zuvor eingewilligt haben. Sie haben das Recht, eine erteilte Einwilligung mit Wirkung auf die Zukunft jederzeit zu widerrufen.</p><p>Personenbezogene Daten werden von uns an die nachfolgend bezeichneten Dritten weitergegeben bzw. übermittelt:</p><ul><li>Verschiedene Dienstleister oder Partnerunternehmen, die uns bei der Bestellabwicklung, bei der Versorgung der Kunden mit Informationen, Werbung und bei der Bereitstellung von Dienstleistungen unterstützen, EDV Dienstleister und technische Verarbeiter (Auftragsverarbeiter gemäß Art. 28 DS-GVO). Diese Unternehmen sind verpflichtet, sämtliche Datenschutzbestimmungen einzuhalten. Für die Auftragsdatenverarbeitung gelten strenge datenschutzrechtliche Vorschriften, insbesondere dürfen diese Unternehmen die Daten ausschließlich zur Erfüllung ihrer Aufgaben in unserem Auftrag nutzen. Für die Einhaltung der datenschutzrechtlichen Vorschriften durch diese Unternehmen sind wir verantwortlich und haben wir entsprechende Auftragsverarbeitungsvereinbarungen mit den Dienstleistern geschlossen</li><li>an unseren Steuerberater zur Erfüllung unserer steuerrechtlichen Verpflichtungen</li></ul><h2>Cookies</h2><p>Unsere Website verwendet so genannte Cookies. Wir nutzen Cookies dazu, unser Angebot nutzerfreundlich zu gestalten. Dabei handelt es sich um kleine Textdateien, die mit Hilfe des br/owsers auf Ihrem Endgerät abgelegt werden. Sie richten keinen Schaden an. Wird der entsprechende Server unserer Website erneut von Ihnen aufgerufen, sendet Ihr br/owser den zuvor empfangenen Cookie wieder zurück an den Server. Der Server kann dann die durch diese Prozedur erhaltenen Informationen auf verschiedene Arten auswerten. Durch Cookies können zB Werbeeinblendungen gesteuert oder das Navigieren auf einer Internetseite erleichtert werden.</p><p>Wenn Sie die Nutzung von Cookies unterbinden möchten, so können Sie dies durch lokale Vornahme der Änderungen Ihrer Einstellungen in dem auf Ihrem Computer verwendeten Internetbr/owser (zB Internet Explorer, Mozilla Firefox, Safari etc.) tun. Sie können Ihren br/owser so einrichten, dass er Sie über das Setzen von Cookies informiert und Sie dies nur im Einzelfall erlauben. Bei der Deaktivierung von Cookies kann zur Einschränkung der Funktionalität unserer Website kommen.</p><h2>Ihre Rechte</h2><p>Ihnen stehen grundsätzlich die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerruf und Widerspruch zu.</p><p>Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt oder Ihre datenschutzrechtlichen Ansprüche sonst in einer Weise verletzt worden sind, können Sie sich bei uns soeren.michaels+wikiparty@gmail.com oder der Datenschutzbehörde beschweren.</p></div>
  )
}

export default App;
