/* =====================================================================
   Treści: checklisty, generatory pism, rejestry, biblioteka Excela
   ===================================================================== */
const ck = (o) => reg(Object.assign({kind:"check", render(root, s){ renderChecklist(this, root, s); }}, o));
const tp = (o) => reg(Object.assign({kind:"tpl", render(root, s){ renderTemplate(this, root, s); }}, o));
const rg = (o) => reg(Object.assign({kind:"reg", render(root, s){ renderRegister(this, root, s); }}, o));

/* ——————————————— CHECKLISTY ——————————————— */
ck({id:"tax-filing", a:"tax", t:"Rozliczenia podatkowe miesiąca", min:30, period:"month", d:"VAT i JPK_V7, KSeF, ZUS, PIT-4, CIT: co sprawdzić i uzgodnić przed wysyłką.", groups:[
  {n:"Przygotowanie danych", items:[["Pobrać z KSeF wszystkie faktury zakupowe i sprzedażowe okresu","Porównaj liczbę i sumy z rejestrami w systemie FK."],"Zaksięgować faktury korygujące i ustalić okres ich ujęcia","Sprawdzić faktury w walutach: kurs z dnia roboczego poprzedzającego obowiązek podatkowy","Zweryfikować faktury z adnotacją „mechanizm podzielonej płatności”",["Sprawdzić rachunki kontrahentów na białej liście VAT (płatności powyżej 15 000 zł)","Brak weryfikacji: ryzyko braku kosztu i solidarnej odpowiedzialności."]]},
  {n:"VAT i JPK_V7", items:["Uzgodnić rejestry VAT z kontami 221 (VAT należny i naliczony)",["Sprawdzić oznaczenia GTU i procedur w JPK","Np. GTU_12 dla usług niematerialnych, TP dla powiązań, MPP."],"Zweryfikować prawo do odliczenia (koszty mieszane, samochody 50%, noclegi, gastronomia)","Sprawdzić import usług, WNT i odwrotne obciążenie","Uzgodnić VAT-UE z ewidencją WDT i WNT","Wygenerować i zwalidować plik JPK_V7 (schemat XSD)",["Złożyć JPK_V7 i zapłacić VAT do 25. dnia","Termin przesuwa się, gdy wypada w dzień wolny."]]},
  {n:"Wynagrodzenia i ZUS", items:["Uzgodnić listy płac z księgą (konta 231, 229)","Złożyć deklaracje ZUS i zapłacić składki w terminie","Zapłacić zaliczki PIT-4 do 20. dnia","Przekazać wpłaty PPK do 15. dnia"]},
  {n:"CIT", items:["Obliczyć zaliczkę CIT (miesięczną lub kwartalną)","Sprawdzić koszty niestanowiące kosztów podatkowych (NKUP)","Sprawdzić limity: finansowanie dłużne, usługi niematerialne od podmiotów powiązanych","Zweryfikować ryzyko podatku minimalnego (strata lub rentowność poniżej 2%)"]},
  {n:"Kontrola końcowa", items:["Druga osoba przejrzała deklaracje przed wysyłką","Zapisano UPO i potwierdzenia przelewów","Zaktualizowano kalendarz podatkowy na kolejny miesiąc"]}]});
ck({id:"tax-ksef", a:"tax", nw:true, t:"KSeF bez stresu", min:30, period:"none", d:"Gotowość firmy do Krajowego Systemu e-Faktur: uprawnienia, integracja, obieg, tryb awaryjny.", groups:[
  {n:"Organizacja i uprawnienia", items:[["Ustalić datę obowiązku KSeF dla firmy i sprawdzić aktualne komunikaty MF","Harmonogram wdrożenia był zmieniany; zawsze weryfikuj na ksef.podatki.gov.pl."],"Nadać uprawnienia w KSeF (ZAW-FA lub w systemie) osobom i integratorom","Wygenerować i bezpiecznie przechowywać tokeny lub certyfikaty KSeF","Wyznaczyć właściciela procesu i zastępcę"]},
  {n:"Systemy", items:["Potwierdzić z dostawcą ERP obsługę struktury FA(3)","Przetestować wysyłkę i odbiór faktur w środowisku testowym KSeF","Zmapować pola: kontrahenci, jednostki, stawki, adnotacje, załączniki","Ustawić automatyczne pobieranie faktur zakupowych","Zapewnić archiwizację numerów KSeF i UPO"]},
  {n:"Procesy", items:["Zaktualizować obieg faktur kosztowych (opis, akceptacja, księgowanie)","Ustalić sposób przekazywania faktur odbiorcom spoza KSeF (wizualizacja z kodem QR)","Opracować procedurę korekt i duplikatów","Określić sposób obsługi faktur do paragonów i faktur dla konsumentów","Przeszkolić dział sprzedaży, zakupów i księgowości"]},
  {n:"Tryby awaryjne", items:["Opisać procedurę trybu offline24 i dosyłania faktur","Opisać procedurę na wypadek awarii KSeF ogłoszonej przez MF","Opisać procedurę na wypadek awarii po stronie firmy","Przeprowadzić test awaryjny z zespołem"]},
  {n:"Kontrola jakości", items:["Codzienny raport faktur odrzuconych przez KSeF","Miesięczne uzgodnienie: KSeF vs rejestry VAT vs JPK","Przegląd uprawnień co kwartał"]}]});
ck({id:"tax-audit", a:"tax", t:"Przygotowanie do kontroli", min:40, period:"custom", d:"Kontrola podatkowa lub celno-skarbowa: dokumenty, pełnomocnictwa, harmonogram, komunikacja z organem.", groups:[
  {n:"Po otrzymaniu zawiadomienia", items:[["Sprawdzić zakres, okres i podstawę kontroli","Kontrola podatkowa co do zasady rozpoczyna się nie wcześniej niż 7 dni od doręczenia zawiadomienia."],"Rozważyć złożenie korekty deklaracji przed wszczęciem kontroli (czynny żal, korekta)","Ustanowić pełnomocnika i osobę do kontaktu","Poinformować zarząd i ocenić ryzyko finansowe"]},
  {n:"Dokumenty", items:["Przygotować indeks dokumentów i strukturę folderów (okres, obszar, numer)","Zebrać umowy, faktury, dowody płatności, ewidencje i pliki JPK","Przygotować dokumentację cen transferowych, jeśli dotyczy","Przygotować polityki: rachunkowości, VAT, obiegu dokumentów","Założyć rejestr dokumentów przekazanych organowi (data, zakres, osoba)"]},
  {n:"W trakcie kontroli", items:["Zapewnić kontrolującym miejsce i dostęp do dokumentów","Udzielać odpowiedzi na piśmie, po weryfikacji merytorycznej","Sporządzać notatki z każdej rozmowy","Monitorować terminy (czas trwania kontroli, przedłużenia)"]},
  {n:"Po kontroli", items:["Przeanalizować protokół i w ciągu 14 dni złożyć zastrzeżenia","Rozważyć korektę deklaracji w terminie 14 dni od doręczenia protokołu","Wdrożyć działania naprawcze i zaktualizować procedury"]}]});
ck({id:"ctl-gl", a:"ctl", t:"Zamknięcie miesiąca", min:35, period:"month", d:"Nadzór nad księgą główną: kompletność, uzgodnienia, rozliczenia międzyokresowe, rezerwy, kursy.", groups:[
  {n:"D+1: kompletność", items:["Zamknąć moduły: sprzedaż, zakupy, magazyn, środki trwałe, płace","Zaksięgować wszystkie wyciągi bankowe do ostatniego dnia","Sprawdzić faktury z KSeF niezaksięgowane w okresie","Ująć dostawy niefakturowane i usługi bez faktur (bierne RMK)"]},
  {n:"D+2: uzgodnienia", items:["Uzgodnić rachunki bankowe i lokaty","Uzgodnić rozrachunki z odbiorcami i dostawcami (analityka vs syntetyka)","Uzgodnić rozrachunki wewnątrzgrupowe","Uzgodnić konta VAT z deklaracją","Wyjaśnić salda kont przejściowych i technicznych"]},
  {n:"D+3: wyceny i rezerwy", items:["Naliczyć amortyzację","Wycenić pozycje walutowe po kursie średnim NBP z ostatniego dnia","Utworzyć lub rozwiązać rezerwy (urlopy, premie, gwarancje, sprawy sporne)","Rozliczyć czynne RMK (ubezpieczenia, licencje, prenumeraty)","Ocenić odpisy aktualizujące należności i zapasy"]},
  {n:"D+4: analiza", items:["Przegląd ręcznych dekretów powyżej progu","Analiza sald nietypowych (ujemne należności, dodatnie zobowiązania)","Analiza odchyleń wyniku vs budżet i vs poprzedni miesiąc","Przegląd rentowności i marż"]},
  {n:"D+5: raport", items:["Przygotować pakiet raportowy dla zarządu","Zablokować okres w systemie","Zapisać notatkę z problemami do poprawy w kolejnym zamknięciu"]}]});
ck({id:"ctl-compliance", a:"ctl", t:"Monitorowanie zgodności", min:30, period:"year", d:"Roczna lista obowiązków: rachunkowość, podatki, AML, kowenanty, sprawozdawczość statystyczna.", groups:[
  {n:"Rachunkowość i sprawozdawczość", items:["Aktualna polityka rachunkowości i zakładowy plan kont","Inwentaryzacja (terminy i metody zgodnie z art. 26–27 UoR)","Badanie sprawozdania przez biegłego rewidenta, jeśli dotyczy","Złożenie sprawozdania do KRS i uchwały o podziale wyniku"]},
  {n:"Podatki", items:["Kalendarz podatkowy i przypisani właściciele","Dokumentacja cen transferowych i TPR","Procedura MDR (schematy podatkowe)","Informacja o strategii podatkowej (jeśli dotyczy)","Weryfikacja białej listy VAT w procesie płatności"]},
  {n:"AML i sankcje", items:["Ocena, czy firma jest instytucją obowiązaną (AML)","Weryfikacja kontrahentów na listach sankcyjnych","Zgłoszenie beneficjentów rzeczywistych w CRBR (aktualizacja przy zmianach)"]},
  {n:"Finansowanie", items:["Monitoring kowenantów bankowych (kwartalnie)","Terminy przekazania raportów do banków","Polisy ubezpieczeniowe cedowane na bank"]},
  {n:"Terminy zapłaty i raportowanie", items:["Monitoring terminów zapłaty w transakcjach handlowych (maks. 60 dni, 30 dni dla podmiotów publicznych)","Sprawozdanie o terminach zapłaty (duzi przedsiębiorcy, do 31 stycznia)","Sprawozdania statystyczne GUS i NBP"]}]});
ck({id:"ctl-report", a:"ctl", t:"Sprawozdawczość finansowa", min:40, period:"year", d:"Roczne sprawozdanie finansowe: harmonogram, uzgodnienia krzyżowe, noty, zatwierdzenie i KRS.", groups:[
  {n:"Przygotowanie", items:["Harmonogram prac z biegłym rewidentem","Inwentaryzacja i rozliczenie różnic","Zamknięcie roku w księgach i przeksięgowania wynikowe","Wycena bilansowa (rezerwy, odpisy, podatek odroczony)"]},
  {n:"Sporządzenie", items:["Bilans, rachunek zysków i strat, rachunek przepływów, zestawienie zmian w kapitale","Informacja dodatkowa i noty objaśniające","Sprawozdanie z działalności (jeśli wymagane)","Uzgodnienia krzyżowe: wynik RZiS = wynik w bilansie; zmiana gotówki = rachunek przepływów","Porównywalność danych z rokiem poprzednim"]},
  {n:"Terminy (rok kalendarzowy)", items:[["Sporządzenie i podpisanie do 31 marca","Podpis elektroniczny kierownika jednostki i osoby prowadzącej księgi."],"Badanie przez biegłego rewidenta (jeśli dotyczy)","Zatwierdzenie przez zgromadzenie wspólników do 30 czerwca","Złożenie w KRS (Repozytorium Dokumentów Finansowych) w ciągu 15 dni od zatwierdzenia"]},
  {n:"Jakość", items:["Przegląd analityczny zmian rok do roku","Checklista ujawnień","Druga osoba przejrzała noty i liczby"]}]});
ck({id:"ctl-esg", a:"ctl", nw:true, t:"Raportowanie ESG", min:40, period:"year", d:"CSRD i ESRS: podwójna istotność, dane, emisje, kontrola jakości. Zakres zależy od aktualnych przepisów.", groups:[
  {n:"Zakres i obowiązek", items:[["Ustalić, czy i od kiedy firma podlega raportowaniu zrównoważonego rozwoju","Po zmianach pakietu Omnibus progi i terminy mogły się zmienić. Zweryfikuj aktualny stan prawny."],"Ustalić zakres (jednostkowy lub skonsolidowany) i odpowiedzialność zarządu"]},
  {n:"Podwójna istotność", items:["Zidentyfikować interesariuszy i przeprowadzić konsultacje","Ocenić istotność wpływu (na ludzi i środowisko)","Ocenić istotność finansową (ryzyka i szanse)","Udokumentować progi i wyniki oceny"]},
  {n:"Dane", items:["Zmapować wskaźniki ESRS do źródeł danych i właścicieli","Zebrać dane o zużyciu energii i paliw (zakres 1 i 2)","Zaplanować zbieranie danych od dostawców (zakres 3)","Połączyć dane ESG z danymi finansowymi (CAPEX, OPEX, taksonomia)"]},
  {n:"Kontrola i atestacja", items:["Wdrożyć kontrole nad danymi ESG (jak nad danymi finansowymi)","Uzgodnić zakres atestacji z biegłym rewidentem","Przygotować rozdział w sprawozdaniu z działalności"]}]});
ck({id:"cfo-ma", a:"cfo", t:"Analiza M&A", min:45, period:"custom", d:"Finansowe due diligence: jakość zysków, dług netto, kapitał obrotowy, podatki, zobowiązania warunkowe.", groups:[
  {n:"Jakość zysków (QoE)", items:["Normalizacja EBITDA: zdarzenia jednorazowe, wynagrodzenia właścicieli, transakcje z podmiotami powiązanymi","Analiza przychodów: klienci, umowy, koncentracja, churn","Analiza marż według produktów i klientów","Uzgodnienie wyników zarządczych z badanymi sprawozdaniami"]},
  {n:"Dług netto i pozycje dłużnopodobne", items:["Kredyty, leasingi, faktoring z regresem","Zaległe zobowiązania publicznoprawne i przeterminowane zobowiązania handlowe","Rezerwy (odprawy, sprawy sądowe, gwarancje)","Dywidendy niewypłacone, pożyczki od wspólników"]},
  {n:"Kapitał obrotowy", items:["Normalizowany poziom kapitału obrotowego (12–24 miesiące)","Sezonowość i manipulacje przed transakcją (wstrzymane płatności)","Jakość należności (wiekowanie) i zapasów (rotacja, wolno rotujące)"]},
  {n:"Podatki", items:["Zaległości i ryzyka VAT, CIT, PIT, ZUS (5 lat wstecz)","Ceny transferowe i dokumentacja","Ulgi i zwolnienia (warunki utrzymania, np. strefa inwestycyjna)","Straty podatkowe i możliwość ich rozliczenia po transakcji"]},
  {n:"Transakcja", items:["Mechanizm ceny: locked box lub completion accounts","Zapewnienia i gwarancje, ubezpieczenie W&I","Synergie: realne, harmonogram, koszty integracji","Zgody (UOKiK, banki, kontrahenci ze zmianą kontroli)"]}]});
ck({id:"cfo-strat", a:"cfo", t:"Planowanie strategiczne", min:45, period:"year", d:"Finansowy plan strategiczny: ambicje, alokacja kapitału, finansowanie, inicjatywy, KPI, kamienie milowe.", groups:[
  {n:"Punkt wyjścia", items:["Analiza wyników 3 lat: wzrost, marże, konwersja gotówki, ROIC","Analiza rynku i konkurencji","Ocena potencjału organizacji i systemów"]},
  {n:"Ambicje i cele", items:["Cele finansowe na 3–5 lat (SMART)","Założenia makroekonomiczne i scenariusze","Polityka dywidendowa i struktura kapitału"]},
  {n:"Alokacja kapitału", items:["Lista inicjatyw z NPV, IRR i ryzykiem","Priorytety inwestycji (wzrost, utrzymanie, efektywność)","Plan finansowania (dług, kapitał, leasing, dotacje)"]},
  {n:"Wdrożenie", items:["Właściciele inicjatyw i budżety","KPI i rytm przeglądów (kwartalnie)","Kamienie milowe i punkty decyzyjne","Plan komunikacji dla rady nadzorczej i banków"]}]});
ck({id:"ap-flow", a:"ap", t:"Obieg faktur", min:25, period:"none", d:"Usprawniony obieg faktur zakupowych z KSeF: rejestracja, dopasowanie, akceptacja, płatność, archiwum.", groups:[
  {n:"Rejestracja", items:["Automatyczne pobieranie faktur z KSeF do systemu","Jedna skrzynka dla faktur spoza KSeF (np. zagranicznych)","Automatyczna weryfikacja NIP, rachunku i duplikatów"]},
  {n:"Dopasowanie i akceptacja", items:["Dopasowanie trójstronne: zamówienie, przyjęcie, faktura","Macierz akceptacji według progów kwot i centrów kosztów","Zastępstwa na czas urlopów","Termin akceptacji (np. 3 dni robocze) i eskalacja"]},
  {n:"Płatność", items:["Weryfikacja białej listy VAT przed przelewem","Mechanizm podzielonej płatności dla faktur z adnotacją","Przebiegi płatności 1–2 razy w tygodniu","Kontrola dwóch osób dla przelewów powyżej progu"]},
  {n:"Mierniki", items:["Czas od wpływu do zaksięgowania","Odsetek faktur zapłaconych w terminie","Koszt obsługi jednej faktury","Liczba faktur bez zamówienia"]}]});
ck({id:"tool-outlook", a:"tool", t:"Outlook", min:10, period:"none", d:"Konfiguracja Outlooka dla finansisty: reguły, szybkie kroki, kategorie, szablony, blokowanie czasu.", groups:[
  {n:"Porządek w skrzynce", items:[["Reguła: faktury i powiadomienia KSeF do folderu „Faktury”","Plik → Reguły i alerty → Nowa reguła → od nadawcy lub ze słowem w temacie."],"Reguła: wiadomości od zarządu oznaczaj kategorią „Pilne”","Reguła: powiadomienia systemowe do folderu, bez powiadomień","Włącz „Skrzynkę Priorytetowe”"]},
  {n:"Szybkie kroki", items:["Szybki krok „Do akceptacji”: przenieś, oznacz flagą, kategoria","Szybki krok „Przekaż do księgowości” z gotowym tekstem","Szybki krok „Gotowe”: oznacz jako przeczytane i archiwizuj"]},
  {n:"Szablony i czas", items:["Zapisz szablony odpowiedzi (Moje szablony) dla powtarzalnych pytań","Zaplanuj wysyłkę raportów (Opóźnij dostarczenie)","Zablokuj w kalendarzu dni zamknięcia miesiąca (D+1 do D+5)","Dodaj terminy podatkowe z pliku .ics (moduł „Kalendarz podatkowy”)"]}]});

/* ——————————————— REJESTRY ——————————————— */
rg({id:"aud-risk", a:"aud", t:"Ocena ryzyka", min:35, d:"Rejestr ryzyk finansowych z oceną prawdopodobieństwa i wpływu, mapą ciepła i planem działań.", scoreLabel:"Ocena", sort:true,
  help:"Oceń prawdopodobieństwo i wpływ w skali 1–5. Ocena = prawdopodobieństwo × wpływ (powyżej 15 wysokie, 8–14 średnie). Tabela zapisuje się automatycznie.",
  cols:[{k:"r",l:"Ryzyko"},{k:"c",l:"Kategoria",type:"sel",o:["płynność","kredytowe","walutowe","stopa procentowa","operacyjne","nadużycia","regulacyjne","IT i cyber"]},{k:"p",l:"Prawdop.",type:"score"},{k:"i",l:"Wpływ",type:"score"},{k:"o",l:"Właściciel"},{k:"m",l:"Działanie ograniczające"}],
  score: r => (+r.p || 0) * (+r.i || 0), badge: scoreBadge, extra: rows => heatmap(rows, "p", "i"),
  seed:[{r:"Umocnienie złotego obniża przychody eksportowe",c:"walutowe",p:"4",i:"4",o:"CFO",m:"Forwardy na 50% ekspozycji na 12 miesięcy"},{r:"Niewypłacalność kluczowego odbiorcy",c:"kredytowe",p:"2",i:"5",o:"Kierownik należności",m:"Ubezpieczenie należności, limit kredytu kupieckiego"},{r:"Wyłudzenie przelewu (zmiana rachunku dostawcy)",c:"nadużycia",p:"3",i:"4",o:"Kierownik AP",m:"Weryfikacja telefoniczna, biała lista VAT"},{r:"Wzrost WIBOR podnosi koszt kredytu",c:"stopa procentowa",p:"2",i:"3",o:"Skarbnik",m:"IRS na część kredytu"},{r:"Awaria systemu ERP w zamknięciu roku",c:"IT i cyber",p:"2",i:"4",o:"Dyrektor IT",m:"Kopie zapasowe, test odtworzenia"}]});
rg({id:"ctl-ic", a:"ctl", t:"Kontrola wewnętrzna", min:35, d:"Macierz ryzyk i kontroli (RCM): typ, częstotliwość, właściciel, dowód i ocena skuteczności.", scoreLabel:"Status",
  help:"Opisz kontrole w procesie. Status wskazuje luki: kontrola nieskuteczna, nietestowana lub bez właściciela.",
  cols:[{k:"pr",l:"Proces"},{k:"r",l:"Ryzyko"},{k:"k",l:"Kontrola"},{k:"t",l:"Typ",type:"sel",o:["prewencyjna","detekcyjna"]},{k:"a",l:"Sposób",type:"sel",o:["manualna","automatyczna","półautomatyczna"]},{k:"f",l:"Częstotliwość",type:"sel",o:["każdorazowo","dzienna","tygodniowa","miesięczna","kwartalna","roczna"]},{k:"o",l:"Właściciel"},{k:"e",l:"Dowód"},{k:"s",l:"Skuteczność",type:"sel",o:["nietestowana","skuteczna","częściowo skuteczna","nieskuteczna"]}],
  score: r => (r.s === "nieskuteczna" ? 3 : r.s === "częściowo skuteczna" ? 2 : r.s === "nietestowana" ? 1 : 0) + (r.o ? 0 : 1),
  badge: sc => sc >= 3 ? '<span class="pill bad">luka</span>' : sc >= 1 ? '<span class="pill warn">do weryfikacji</span>' : '<span class="pill good">OK</span>', sort:true,
  extra: rows => { const n = rows.length, auto = rows.filter(r => r.a === "automatyczna").length, bad = rows.filter(r => r.s === "nieskuteczna").length, nt = rows.filter(r => r.s === "nietestowana").length;
    return `<div class="kpis">${kpi("Kontroli", n)}${kpi("Automatycznych", pct(n ? auto / n : 0))}${kpi("Nieskutecznych", bad, "", bad ? "bad" : "good")}${kpi("Nietestowanych", nt, "", nt ? "warn" : "good")}</div>`; },
  seed:[{pr:"Zakupy i płatności",r:"Płatność dla fikcyjnego dostawcy",k:"Zakładanie dostawcy wymaga akceptacji drugiej osoby i weryfikacji NIP",t:"prewencyjna",a:"manualna",f:"każdorazowo",o:"Kierownik AP",e:"Log zmian w ERP",s:"skuteczna"},{pr:"Zakupy i płatności",r:"Podwójna płatność faktury",k:"System blokuje duplikat numeru faktury dla dostawcy",t:"prewencyjna",a:"automatyczna",f:"każdorazowo",o:"IT",e:"Konfiguracja ERP",s:"nietestowana"},{pr:"Zamknięcie miesiąca",r:"Błędny ręczny dekret",k:"Przegląd dekretów ręcznych powyżej 50 000 zł",t:"detekcyjna",a:"manualna",f:"miesięczna",o:"",e:"Podpisany raport",s:"częściowo skuteczna"}]});
rg({id:"perf-process", a:"perf", t:"Usprawnianie procesów", min:30, d:"Lista usprawnień z oceną wpływu i nakładu. Wskazuje szybkie wygrane i liczy zaoszczędzone godziny.", scoreLabel:"Priorytet", sort:true,
  help:"Oceń wpływ i nakład w skali 1–5. Priorytet = wpływ × 2 − nakład. Szybka wygrana: wpływ co najmniej 4 i nakład najwyżej 2.",
  cols:[{k:"u",l:"Usprawnienie"},{k:"pr",l:"Proces"},{k:"w",l:"Wpływ",type:"score"},{k:"n",l:"Nakład",type:"score"},{k:"h",l:"Godzin/mies.",type:"num"},{k:"o",l:"Właściciel"},{k:"t",l:"Termin"}],
  score: r => (+r.w || 0) * 2 - (+r.n || 0), badge: (sc) => sc >= 6 ? `<span class="pill good num">${sc} · wysoki</span>` : sc >= 3 ? `<span class="pill warn num">${sc} · średni</span>` : `<span class="pill num">${sc} · niski</span>`,
  extra: rows => { const hrs = rows.reduce((a, r) => a + (parseNum(r.h) || 0), 0), qw = rows.filter(r => +r.w >= 4 && +r.n <= 2); return `<div class="kpis">${kpi("Potencjał oszczędności", fmt(hrs) + " h/mies.", fmt(hrs * 12) + " h rocznie", "good")}${kpi("Szybkie wygrane", qw.length)}</div>${qw.length ? `<div class="note"><b>Zacznij od:</b> ${qw.map(r => esc(r.u)).join("; ")}.</div>` : ""}`; },
  seed:[{u:"Automatyczne pobieranie faktur z KSeF do ERP",pr:"Zakupy",w:"5",n:"2",h:"40",o:"Kierownik AP",t:"XI 2026"},{u:"Import wyciągów bankowych i automatyczne rozliczanie",pr:"Skarb",w:"4",n:"2",h:"25",o:"Skarbnik",t:"XII 2026"},{u:"Szablon raportu miesięcznego z automatycznym odświeżaniem",pr:"Raportowanie",w:"4",n:"3",h:"12",o:"Kontroler",t:"I 2027"},{u:"Wymiana systemu płacowego",pr:"Płace",w:"3",n:"5",h:"15",o:"HR",t:"2027"}]});

/* ——————————————— GENERATORY PISM ——————————————— */
tp({id:"ap-remind", a:"ap", t:"Przypomnienia o płatnościach", min:15, d:"Liczy odsetki za opóźnienie i rekompensatę 40/70/100 EUR, a potem tworzy przypomnienie, wezwanie lub notę odsetkową.",
  fields:[{k:"klient",l:"Klient",ex:"Hurtownia Delta sp. z o.o."},{k:"faktura",l:"Numer faktury",ex:"FV/2026/08/114"},{k:"kwota",l:"Kwota brutto (zł)",ex:"48 600,00",type:"num"},{k:"termin",l:"Termin płatności",type:"date",ex:() => isoDate(addDays(today(), -12))},{k:"zaplata",l:"Data zapłaty (puste = dziś)",type:"date",ex:""},
    {k:"typ",l:"Rodzaj odsetek",type:"select",o:["handlowe (stopa ref. NBP + 10 p.p.)","handlowe, dłużnik podmiot publiczny (+ 8 p.p.)","ustawowe za opóźnienie (+ 5,5 p.p.)"]},{k:"ref",l:"Stopa referencyjna NBP %",prof:"ref",hint:"Sprawdź aktualną wartość na nbp.pl."},{k:"eur",l:"Kurs EUR (NBP)",prof:"eur"},{k:"rachunek",l:"Nasz rachunek",prof:"rachunek",ex:"PL61 1090 1014 0000 0712 1981 2874"},{k:"podpis",l:"Podpis",prof:"podpis",ex:"Anna Kowalska, Dział Należności"}],
  extraVars:["dni","odsetki","rekompensata_eur","rekompensata_zl","razem","stopa","dzis","firma"],
  compute(v){
    const amt = parseNum(v.kwota) || 0, due = parseDate(v.termin), pay = parseDate(v.zaplata) || today(), days = due ? Math.max(0, dayDiff(due, pay)) : 0;
    const add = v.typ.includes("+ 8") ? 8 : v.typ.includes("5,5") ? 5.5 : 10, rate = (parseNum(v.ref) || 0) + add;
    const ods = Math.round(amt * rate / 100 * days / 365 * 100) / 100, eurA = amt <= 5000 ? 40 : amt < 50000 ? 70 : 100, eurR = parseNum(v.eur) || 0, rek = Math.round(eurA * eurR * 100) / 100;
    return {dni: String(days), odsetki: fmt(ods, 2) + " zł", rekompensata_eur: eurA + " EUR", rekompensata_zl: fmt(rek, 2) + " zł", razem: fmt(amt + ods + (days ? rek : 0), 2) + " zł", stopa: fmt(rate, 2) + "%",
      _info: `<div class="kpis">${kpi("Dni opóźnienia", days, "", days ? "warn" : "good")}${kpi("Odsetki", fmt(ods, 2) + " zł", "stopa " + fmt(rate, 2) + "% rocznie")}${kpi("Rekompensata", eurA + " EUR", fmt(rek, 2) + " zł" + (days ? "" : " (należna po terminie)"))}${kpi("Razem do zapłaty", fmt(amt + ods + (days ? rek : 0), 2) + " zł")}</div><span class="hint">Rekompensata za koszty odzyskiwania należności przysługuje w transakcjach handlowych po upływie terminu zapłaty, bez wezwania. Kurs: średni NBP z ostatniego dnia roboczego miesiąca poprzedzającego miesiąc, w którym świadczenie stało się wymagalne.</span>`}; },
  variants:{
"Przypomnienie przed terminem":`Temat: Przypomnienie o terminie płatności faktury {{faktura}}

Szanowni Państwo,

uprzejmie przypominamy, że termin płatności faktury {{faktura}} na kwotę {{kwota}} zł upływa {{termin}}.

Prosimy o przelew na rachunek {{rachunek}}. Jeśli płatność została już zlecona, prosimy potraktować tę wiadomość jako nieaktualną.

Z poważaniem
{{podpis}}`,
"Przypomnienie po terminie":`Temat: Zaległa płatność za fakturę {{faktura}}

Szanowni Państwo,

informujemy, że faktura {{faktura}} na kwotę {{kwota}} zł nie została opłacona w terminie ({{termin}}). Opóźnienie wynosi {{dni}} dni.

Prosimy o uregulowanie należności w ciągu 7 dni na rachunek {{rachunek}}. W przypadku trudności z płatnością zapraszamy do kontaktu, chętnie uzgodnimy harmonogram spłaty.

Z poważaniem
{{podpis}}`,
"Wezwanie do zapłaty (przedsądowe)":`{{firma}}
{{dzis}}

{{klient}}

OSTATECZNE PRZEDSĄDOWE WEZWANIE DO ZAPŁATY

Działając w imieniu {{firma}}, wzywam do zapłaty kwoty {{razem}}, na którą składają się:
- należność główna z faktury {{faktura}}: {{kwota}} zł, wymagalna od {{termin}},
- odsetki za opóźnienie w transakcjach handlowych ({{stopa}} rocznie) za {{dni}} dni: {{odsetki}},
- rekompensata za koszty odzyskiwania należności: {{rekompensata_eur}} ({{rekompensata_zl}}).

Kwotę należy wpłacić w terminie 7 dni od otrzymania wezwania na rachunek {{rachunek}}.

Brak zapłaty w tym terminie spowoduje skierowanie sprawy na drogę postępowania sądowego, co narazi Państwa na dodatkowe koszty.

{{podpis}}`,
"Nota odsetkowa":`NOTA ODSETKOWA
Data wystawienia: {{dzis}}

Wystawca: {{firma}}
Odbiorca: {{klient}}

Tytuł: odsetki za opóźnienie w zapłacie faktury {{faktura}}
Kwota należności: {{kwota}} zł
Termin płatności: {{termin}}
Data zapłaty: {{zaplata}}
Liczba dni opóźnienia: {{dni}}
Stopa odsetek: {{stopa}} rocznie
Kwota odsetek: {{odsetki}}

Prosimy o zapłatę w terminie 14 dni na rachunek {{rachunek}}.

{{podpis}}`}});
tp({id:"ap-vendor", a:"ap", t:"Komunikacja z dostawcami", min:10, d:"Gotowe wiadomości do dostawców: termin płatności, korekta, potwierdzenie salda, zmiana rachunku, harmonogram.",
  fields:[{k:"dostawca",l:"Dostawca",ex:"TransLog S.A."},{k:"faktura",l:"Faktura / dokument",ex:"FV/2026/08/114"},{k:"kwota",l:"Kwota",ex:"23 400,00 zł"},{k:"szczegoly",l:"Szczegóły",type:"textarea",ex:"zawyżona stawka za paletę (18 zł zamiast 15 zł zgodnie z umową)"},{k:"data",l:"Data / termin",ex:"31.10.2026"},{k:"podpis",l:"Podpis",prof:"podpis",ex:"Anna Kowalska, Dział Księgowości"}],
  variants:{
"Prośba o wydłużenie terminu":`Temat: Prośba o wydłużenie terminu płatności – {{faktura}}

Szanowni Państwo,

zwracamy się z prośbą o wydłużenie terminu płatności faktury {{faktura}} na kwotę {{kwota}} do dnia {{data}}.

{{#szczegoly}}Powód: {{szczegoly}}.
{{/szczegoly}}
Cenimy współpracę z {{dostawca}} i zapewniamy, że płatność zostanie zrealizowana w nowym terminie. Będziemy wdzięczni za potwierdzenie.

Z poważaniem
{{podpis}}`,
"Prośba o fakturę korygującą":`Temat: Prośba o korektę faktury {{faktura}}

Szanowni Państwo,

po weryfikacji faktury {{faktura}} stwierdziliśmy niezgodność: {{szczegoly}}.

Prosimy o wystawienie faktury korygującej w KSeF. Do czasu jej otrzymania wstrzymujemy płatność w części spornej; część bezsporną zapłacimy w terminie.

Z poważaniem
{{podpis}}`,
"Potwierdzenie salda":`Temat: Potwierdzenie salda na dzień {{data}}

Szanowni Państwo,

zgodnie z naszymi księgami saldo rozrachunków z {{dostawca}} na dzień {{data}} wynosi {{kwota}} (zobowiązanie wobec Państwa).

Prosimy o potwierdzenie salda lub przesłanie zestawienia różnic w ciągu 14 dni.
{{#szczegoly}}
Uwagi: {{szczegoly}}
{{/szczegoly}}
Z poważaniem
{{podpis}}`,
"Weryfikacja zmiany rachunku":`Temat: Weryfikacja zmiany numeru rachunku bankowego

Szanowni Państwo,

otrzymaliśmy informację o zmianie rachunku bankowego {{dostawca}}. Zgodnie z naszą procedurą bezpieczeństwa zmianę potwierdzamy telefonicznie pod numerem z umowy (nie z otrzymanej wiadomości) oraz w wykazie podatników VAT.

Do czasu potwierdzenia płatności realizujemy na dotychczasowy rachunek. Prosimy o kontakt osoby uprawnionej do reprezentacji.

Z poważaniem
{{podpis}}`,
"Propozycja harmonogramu spłaty":`Temat: Propozycja harmonogramu spłaty – {{dostawca}}

Szanowni Państwo,

proponujemy spłatę zobowiązania w kwocie {{kwota}} w ratach, z ostatnią ratą do {{data}}:
{{szczegoly}}

Harmonogram pozwoli nam utrzymać płynność bez przerywania współpracy. Prosimy o akceptację lub propozycję zmian.

Z poważaniem
{{podpis}}`}});
tp({id:"fa-report", a:"fa", t:"Generowanie raportów", min:40, d:"Szkielet miesięcznego raportu zarządczego z komentarzem „co, dlaczego, co dalej” i listą kontroli jakości.",
  fields:[{k:"okres",l:"Okres",ex:() => MONTHS[(today().getMonth() + 11) % 12] + " " + (today().getMonth() ? today().getFullYear() : today().getFullYear() - 1)},{k:"odbiorca",l:"Odbiorca",ex:"Zarząd"},{k:"przychody",l:"Przychody (wykonanie, vs budżet)",ex:"3,95 mln zł (−6% vs budżet)"},{k:"ebitda",l:"EBITDA",ex:"0,41 mln zł, marża 10,4% (budżet 12%)"},{k:"gotowka",l:"Gotówka i dług netto",ex:"1,85 mln zł; dług netto 7,6 mln zł (2,0× EBITDA)"},{k:"wydarzenia",l:"Kluczowe wydarzenia",type:"textarea",ex:"przesunięcie zamówień Alfa Retail na październik; wzrost cen energii o 27%"},{k:"dzialania",l:"Planowane działania",type:"textarea",ex:"renegocjacja umowy na energię; przegląd cennika dla klientów klasy C"},{k:"autor",l:"Autor",prof:"podpis",ex:"Dział Kontrolingu"}],
  tpl:`RAPORT ZARZĄDCZY – {{okres}}
Dla: {{odbiorca}} · Przygotował: {{autor}} · {{dzis}}

1. NAJWAŻNIEJSZE W 3 ZDANIACH
- Przychody: {{przychody}}.
- EBITDA: {{ebitda}}.
- Płynność: {{gotowka}}.

2. CO SIĘ WYDARZYŁO I DLACZEGO
{{wydarzenia}}

3. WYNIKI (uzupełnij z modułu „Analiza odchyleń”)
Pozycja | Budżet | Wykonanie | Odchylenie | Komentarz
Przychody | | | |
Marża brutto | | | |
Koszty stałe | | | |
EBITDA | | | |

4. GOTÓWKA I KAPITAŁ OBROTOWY
DSO / DIO / DPO (moduł „Wskaźniki efektywności”), prognoza 13 tygodni (moduł „Płynność na 13 tygodni”).

5. CO DALEJ
{{dzialania}}

6. DECYZJE POTRZEBNE OD ZARZĄDU
- [ ]

KONTROLA JAKOŚCI PRZED WYSYŁKĄ
[ ] Liczby zgodne z księgą po zamknięciu okresu
[ ] Suma kontrolna tabel sprawdzona
[ ] Komentarz wyjaśnia każde istotne odchylenie
[ ] Druga osoba przeczytała raport`});
tp({id:"cfo-comm", a:"cfo", t:"Komunikacja finansowa", min:20, d:"Komunikat o wynikach dla pracowników, inwestorów lub banku, zbudowany według zasady piramidy.",
  fields:[{k:"temat",l:"Temat",ex:"wyniki I półrocza 2026"},{k:"wniosek",l:"Główny wniosek (jedno zdanie)",type:"textarea",ex:"Przychody rosną, ale presja kosztów energii obniżyła rentowność; wdrażamy plan poprawy marży."},{k:"liczby",l:"Kluczowe liczby",type:"textarea",ex:"przychody +6% r/r; EBITDA −4% r/r; dług netto/EBITDA 2,0×"},{k:"dzialania",l:"Co robimy",type:"textarea",ex:"renegocjacja energii, podwyżka cen o 3% od listopada, wstrzymanie rekrutacji w administracji"},{k:"podpis",l:"Podpis",prof:"podpis",ex:"Jan Nowak, CFO"}],
  variants:{
"E-mail do pracowników":`Temat: {{temat}} – najważniejsze informacje

Drodzy,

{{wniosek}}

Najważniejsze liczby:
{{liczby}}

Co robimy dalej:
{{dzialania}}

Dziękuję za Waszą pracę. Na pytania chętnie odpowiem na najbliższym spotkaniu.

{{podpis}}`,
"List do inwestorów":`Szanowni Państwo,

przekazujemy informację o: {{temat}}.

{{wniosek}}

Wyniki w skrócie:
{{liczby}}

Priorytety zarządu na kolejne miesiące:
{{dzialania}}

Pozostajemy do dyspozycji w razie pytań.

{{podpis}}`,
"Informacja dla banku":`Temat: Informacja finansowa – {{temat}}

Szanowni Państwo,

w ramach obowiązków informacyjnych z umowy kredytowej przekazujemy informację o: {{temat}}.

{{wniosek}}

Kluczowe dane i wskaźniki (w tym kowenanty):
{{liczby}}

Podejmowane działania:
{{dzialania}}

Pełny pakiet raportowy w załączeniu.

{{podpis}}`}});
tp({id:"aud-issue", a:"aud", t:"Dokumentowanie ustaleń", min:20, d:"Karta ustalenia z audytu w strukturze 5C: stan faktyczny, kryterium, przyczyna, skutek, rekomendacja.",
  fields:[{k:"tytul",l:"Tytuł ustalenia",ex:"Brak drugiej akceptacji przelewów powyżej progu"},{k:"stan",l:"Stan faktyczny",type:"textarea",ex:"W 7 z 40 zbadanych płatności powyżej 50 000 zł brak drugiej akceptacji w systemie bankowym."},{k:"kryterium",l:"Kryterium (wymóg)",type:"textarea",ex:"Instrukcja obiegu płatności, pkt 4.2: przelewy powyżej 50 000 zł wymagają akceptacji dwóch osób."},{k:"przyczyna",l:"Przyczyna",type:"textarea",ex:"Uprawnienia w bankowości pozwalają jednej osobie na samodzielną akceptację; brak okresowego przeglądu uprawnień."},{k:"skutek",l:"Skutek / ryzyko",type:"textarea",ex:"Ryzyko nieuprawnionej lub błędnej płatności, w tym wyłudzenia."},{k:"ocena",l:"Istotność",type:"select",o:["wysoka","średnia","niska"]},{k:"rekomendacja",l:"Rekomendacja",type:"textarea",ex:"Zmienić schemat akceptacji w bankowości na dwuosobowy dla kwot powyżej 50 000 zł; kwartalny przegląd uprawnień."},{k:"wlasciciel",l:"Właściciel działania",ex:"Skarbnik"},{k:"termin",l:"Termin",ex:"30.11.2026"}],
  tpl:`KARTA USTALENIA AUDYTU
Ustalenie: {{tytul}}
Istotność: {{ocena}}
Data: {{dzis}}

1. Stan faktyczny
{{stan}}

2. Kryterium
{{kryterium}}

3. Przyczyna
{{przyczyna}}

4. Skutek
{{skutek}}

5. Rekomendacja
{{rekomendacja}}

Odpowiedź kierownictwa
Działanie: ………………………………………
Właściciel: {{wlasciciel}}
Termin wdrożenia: {{termin}}
Sposób weryfikacji wdrożenia: ……………………`});
tp({id:"aud-plan", a:"aud", t:"Planowanie audytu", min:35, d:"Karta i program audytu wewnętrznego z harmonogramem i listą dokumentów od audytowanych (PBC).",
  fields:[{k:"obszar",l:"Obszar",ex:"rozliczanie delegacji i kart płatniczych"},{k:"cel",l:"Cel",type:"textarea",ex:"ocena, czy wydatki są uzasadnione, udokumentowane i właściwie zaksięgowane"},{k:"okres",l:"Okres objęty audytem",ex:"01.01–30.06.2026"},{k:"zespol",l:"Zespół",ex:"2 audytorów"},{k:"start",l:"Start prac",type:"date",ex:() => isoDate(addDays(today(), 14))},{k:"tygodnie",l:"Czas trwania (tygodnie)",ex:"3"}],
  extraVars:["t1","t2","t3","koniec"],
  compute(v){ const st = parseDate(v.start) || today(), w = parseNum(v.tygodnie) || 3; const d = k => fmtDate(nextWorkday(addDays(st, Math.round(k)))); return {t1: d(0), t2: d(7 * w * .25), t3: d(7 * w * .8), koniec: d(7 * w)}; },
  tpl:`KARTA AUDYTU WEWNĘTRZNEGO
Obszar: {{obszar}}
Cel: {{cel}}
Okres objęty audytem: {{okres}}
Zespół: {{zespol}}

HARMONOGRAM
{{t1}} – spotkanie otwierające, przekazanie listy PBC
{{t2}} – testy i analiza danych
{{t3}} – omówienie wstępnych ustaleń
{{koniec}} – raport końcowy

PROGRAM AUDYTU
Krok | Test | Próba | Dowód
1 | Przegląd procedur i uprawnień | – | procedura, macierz uprawnień
2 | Analiza całej populacji wydatków (duplikaty, weekendy, progi) | 100% | eksport z systemu
3 | Test szczegółowy wydatków | 25–40 pozycji | faktury, rozliczenia, akceptacje
4 | Test kontroli akceptacji | wg modułu „Testowanie kontroli” | logi systemu
5 | Uzgodnienie z księgą | 100% | zestawienie kont

LISTA DOKUMENTÓW (PBC)
[ ] Procedury i instrukcje dla obszaru: {{obszar}}
[ ] Eksport transakcji za okres {{okres}} (CSV lub XLSX)
[ ] Lista użytkowników i uprawnień
[ ] Schemat organizacyjny i zastępstwa
[ ] Wyniki poprzednich audytów i status rekomendacji`});
tp({id:"day-email", a:"day", t:"E-maile w kilka sekund", min:10, d:"Najczęstsze e-maile finansisty: przekroczenie budżetu, przypomnienie o raporcie, odpowiedź audytorowi, podziękowanie.",
  fields:[{k:"adresat",l:"Adresat (imię)",ex:"Pani Marto"},{k:"temat",l:"Czego dotyczy",ex:"budżet marketingu za sierpień"},{k:"fakty",l:"Fakty i liczby",type:"textarea",ex:"wykonanie 236 tys. zł wobec 180 tys. zł budżetu (+31%), głównie kampania targowa"},{k:"prosba",l:"Czego oczekujesz",ex:"planu wydatków na IV kwartał"},{k:"termin",l:"Termin",ex:"piątku, 2 października"},{k:"podpis",l:"Podpis",prof:"podpis",ex:"Anna Kowalska"}],
  variants:{
"Przekroczenie budżetu":`Temat: {{temat}} – przekroczenie budżetu

{{adresat}},

w podsumowaniu miesiąca widzę, że {{fakty}}.

Proszę o przesłanie {{prosba}} do {{termin}}, abyśmy mogli uwzględnić to w prognozie.

Dziękuję
{{podpis}}`,
"Przypomnienie o terminie":`Temat: Przypomnienie: {{temat}} – termin {{termin}}

{{adresat}},

przypominam o przekazaniu: {{prosba}} do {{termin}}. {{fakty}}

Jeśli potrzebujesz więcej czasu lub pomocy, daj znać.

Pozdrawiam
{{podpis}}`,
"Odpowiedź na pytanie audytora":`Temat: Odp.: {{temat}}

{{adresat}},

w odpowiedzi na pytanie dotyczące: {{temat}}.

{{fakty}}

Dokumenty potwierdzające przesyłam w załączeniu. W razie dodatkowych pytań jestem do dyspozycji do {{termin}}.

Z poważaniem
{{podpis}}`,
"Podziękowanie za dane":`Temat: Dziękuję – {{temat}}

{{adresat}},

dziękuję za szybkie przekazanie danych: {{temat}}. {{fakty}}

Pozdrawiam
{{podpis}}`}});
tp({id:"stk-guide", a:"stk", t:"Wytyczne budżetowe", min:25, d:"Instrukcja budżetowa dla kierowników: założenia, limity, terminy, format danych i zasady uzasadniania.",
  fields:[{k:"rok",l:"Rok budżetu",ex:() => String(today().getFullYear() + 1)},{k:"inflacja",l:"Założona inflacja",ex:"3,5%"},{k:"place",l:"Wzrost wynagrodzeń",ex:"do 6%"},{k:"eur",l:"Kurs EUR/PLN",prof:"eur"},{k:"limit",l:"Limity i zasady",type:"textarea",ex:"koszty stałe działów maksymalnie +3% r/r; CAPEX tylko z okresem zwrotu poniżej 3 lat"},{k:"termin",l:"Termin przekazania",ex:"31 października"},{k:"kontakt",l:"Kontakt",prof:"podpis",ex:"Dział Kontrolingu"}],
  tpl:`WYTYCZNE BUDŻETOWE NA {{rok}}

1. CEL
Przygotowanie budżetów działów na {{rok}} w jednolitym formacie i terminie.

2. ZAŁOŻENIA
- Inflacja: {{inflacja}}
- Wzrost wynagrodzeń: {{place}}
- Kurs EUR/PLN: {{eur}}

3. LIMITY I ZASADY
{{limit}}
- Każdy wydatek powyżej 50 000 zł wymaga krótkiego uzasadnienia (cel, efekt, alternatywa).
- Nowe etaty wymagają uzasadnienia biznesowego.

4. HARMONOGRAM
- Przekazanie budżetu działu: {{termin}}
- Spotkania przeglądowe: 2 tygodnie po terminie
- Zatwierdzenie przez zarząd: do połowy grudnia

5. FORMAT
Plik Excel według szablonu: miesiące w kolumnach, konta kosztowe w wierszach, komentarz przy każdej pozycji odbiegającej o ponad 10% od prognozy bieżącego roku.

Kontakt w sprawie budżetu: {{kontakt}}`});
tp({id:"stk-input", a:"stk", t:"Prośba o dane", min:10, d:"Uprzejma i konkretna prośba o przekazanie danych z terminem, formatem i celem.",
  fields:[{k:"kto",l:"Do kogo",ex:"Kierownicy zakładów"},{k:"lista",l:"Jakie dane",type:"textarea",ex:"- stany zapasów na 30.09\n- zapasy wolno rotujące (powyżej 180 dni)\n- planowane zakupy na IV kwartał"},{k:"cel",l:"Po co",ex:"wycena zapasów na koniec kwartału i odpisy aktualizujące"},{k:"termin",l:"Termin",ex:"3.10.2026, godz. 12:00"},{k:"format",l:"Format",ex:"plik Excel według załączonego szablonu"},{k:"podpis",l:"Podpis",prof:"podpis",ex:"Anna Kowalska, Kontroling"}],
  tpl:`Temat: Prośba o dane do {{termin}} – {{cel}}

{{kto}},

potrzebujemy od Was danych do: {{cel}}.

Prosimy o:
{{lista}}

Termin: {{termin}}
Format: {{format}}

Dane są potrzebne do zamknięcia okresu. Opóźnienie przesunie raport dla zarządu. Jeśli czegoś nie da się przygotować w terminie, dajcie znać wcześniej.

Dziękujemy
{{podpis}}`});
tp({id:"stk-meeting", a:"stk", t:"Przygotowanie spotkania", min:15, d:"Agenda z automatycznie wyliczonym czasem punktów, celem, decyzjami i szablonem notatki.",
  fields:[{k:"temat",l:"Temat",ex:"Przegląd wyników za III kwartał"},{k:"data",l:"Data i godzina",ex:"08.10.2026, 10:00"},{k:"start",l:"Godzina rozpoczęcia",ex:"10:00"},{k:"uczestnicy",l:"Uczestnicy",ex:"Zarząd, dyrektorzy działów"},{k:"cel",l:"Cel i oczekiwane decyzje",type:"textarea",ex:"akceptacja korekty prognozy; decyzja o podwyżce cen"},{k:"punkty",l:"Punkty agendy (punkt; minuty)",type:"textarea",ex:"Wyniki kwartału;15\nOdchylenia i przyczyny;15\nPrognoza na IV kwartał;15\nDecyzje;10\nPodsumowanie i zadania;5"}],
  extraVars:["agenda","czas"],
  compute(v){ const [hh, mm] = (v.start || "10:00").split(":").map(Number); let t = (hh || 0) * 60 + (mm || 0), tot = 0; const lines = parseTable(v.punkty).rows.map((r, i) => { const m = Math.round(parseNum(r[1]) || 10), a = `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`; t += m; tot += m; return `${i + 1}. ${a}–${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}  ${r[0]} (${m} min)`; }); return {agenda: lines.join("\n"), czas: tot + " min"}; },
  tpl:`Temat: Zaproszenie: {{temat}} – {{data}}

SPOTKANIE: {{temat}}
Termin: {{data}} ({{czas}})
Uczestnicy: {{uczestnicy}}

CEL I OCZEKIWANE DECYZJE
{{cel}}

AGENDA
{{agenda}}

PRZED SPOTKANIEM
Proszę o zapoznanie się z załączonym pakietem wyników.

NOTATKA (do uzupełnienia)
Decyzje:
-
Zadania (kto, co, do kiedy):
- `});
tp({id:"tax-research", a:"tax", t:"Research przepisów", min:30, d:"Szablon notatki podatkowej i lista oficjalnych źródeł: ustawy, interpretacje, orzeczenia, projekty.",
  fields:[{k:"pytanie",l:"Pytanie",type:"textarea",ex:"Czy wydatki na samochód osobowy w leasingu używany przez członka zarządu są w całości kosztem podatkowym?"},{k:"fakty",l:"Stan faktyczny",type:"textarea",ex:"Samochód o wartości 210 000 zł, używany także prywatnie; brak ewidencji przebiegu."},{k:"przepisy",l:"Przepisy (akt, artykuł)",type:"textarea",ex:"art. 23 ust. 1 pkt 47a, art. 23 ust. 5a ustawy o CIT; art. 86a ustawy o VAT"},{k:"stanowisko",l:"Wniosek",type:"textarea",ex:"Koszt ograniczony do 75% wydatków eksploatacyjnych; limit dla rat leasingu kapitałowej części według wartości auta."},{k:"autor",l:"Autor",prof:"podpis",ex:"Dział Podatkowy"}],
  tpl:`NOTATKA PODATKOWA
Data: {{dzis}} · Autor: {{autor}}

PYTANIE
{{pytanie}}

STAN FAKTYCZNY
{{fakty}}

PODSTAWA PRAWNA
{{przepisy}}

ANALIZA
1. Brzmienie przepisu:
2. Interpretacje indywidualne i ogólne (sygnatury):
3. Orzecznictwo NSA i WSA (sygnatury):
4. Stanowiska przeciwne i ryzyka:

WNIOSEK
{{stanowisko}}

POZIOM PEWNOŚCI: wysoki / średni / niski
REKOMENDACJA: ……………………

ŹRÓDŁA DO WERYFIKACJI
- ISAP (teksty jednolite ustaw): https://isap.sejm.gov.pl
- Interpretacje KIS (EUREKA): https://eureka.mf.gov.pl
- Orzeczenia sądów administracyjnych (CBOSA): https://orzeczenia.nsa.gov.pl
- Projekty zmian (RCL): https://legislacja.gov.pl
- Objaśnienia i komunikaty MF: https://www.podatki.gov.pl

Stan prawny na dzień: {{dzis}}`});
tp({id:"tool-ppt", a:"tool", t:"PowerPoint", min:20, d:"Struktura prezentacji slajd po slajdzie: tytuły-tezy, treść, wizualizacja i notatki mówcy.",
  fields:[{k:"temat",l:"Temat",ex:"Wyniki za III kwartał 2026"},{k:"odbiorca",l:"Odbiorca",ex:"Rada nadzorcza"},{k:"teza",l:"Główna teza",type:"textarea",ex:"Sprzedaż rośnie zgodnie z planem, marża wymaga działań w obszarze kosztów energii."}],
  variants:{
"Wyniki okresu":`PREZENTACJA: {{temat}} (dla: {{odbiorca}})
Zasada: jeden slajd = jedna teza. Tytuł slajdu to wniosek, nie temat.

1. {{teza}}
   Treść: 3 kluczowe liczby. Wizualizacja: kafelki KPI. Notatki: zacznij od wniosku.
2. Przychody rosną dzięki [czynnik]
   Wizualizacja: wykres kolumnowy r/r według segmentów.
3. Marża spadła o [x] p.p. przez [przyczynę]
   Wizualizacja: wykres pomostowy (waterfall) budżet → wykonanie.
4. Gotówka pod kontrolą: [saldo], cykl konwersji [x] dni
   Wizualizacja: linia salda z 13-tygodniową prognozą.
5. Ryzyka i działania
   Tabela: ryzyko, wpływ, działanie, właściciel.
6. Prognoza na koniec roku
   Scenariusze: bazowy, pesymistyczny, optymistyczny.
7. Decyzje, o które prosimy
   Maksymalnie 3 punkty z rekomendacją.`,
"Wniosek inwestycyjny":`PREZENTACJA: {{temat}} (dla: {{odbiorca}})

1. Rekomendujemy: {{teza}}
2. Problem lub szansa, którą rozwiązujemy (dane z rynku lub operacji)
3. Rozwiązanie i alternatywy (tabela porównawcza)
4. Liczby: NPV, IRR, okres zwrotu (moduł „Research inwestycyjny”)
5. Wrażliwość: co musi się stać, by projekt się nie opłacił
6. Harmonogram i kamienie milowe
7. Ryzyka i sposób ich ograniczenia
8. Decyzja: kwota, termin, warunki`,
"Budżet na kolejny rok":`PREZENTACJA: {{temat}} (dla: {{odbiorca}})

1. Budżet w jednym zdaniu: {{teza}}
2. Założenia makro i rynkowe
3. Przychody: pomost od prognozy bieżącego roku do budżetu
4. Koszty: główne zmiany (wynagrodzenia, energia, marketing)
5. EBITDA i marża według miesięcy (sezonowość)
6. CAPEX i finansowanie
7. Ryzyka budżetu i scenariusz pesymistyczny
8. Prośba o zatwierdzenie`}});

/* ——————————————— BIBLIOTEKA FORMUŁ EXCELA ——————————————— */
const XL = [
  ["Wyszukiwanie","X.WYSZUKAJ","XLOOKUP","Nowoczesne wyszukiwanie w dowolnym kierunku, z wartością domyślną.","=X.WYSZUKAJ(A2;Kontrahenci[NIP];Kontrahenci[Nazwa];\"brak\")","=XLOOKUP(A2,Kontrahenci[NIP],Kontrahenci[Nazwa],\"brak\")"],
  ["Wyszukiwanie","INDEKS + PODAJ.POZYCJĘ","INDEX + MATCH","Wyszukiwanie działające także w starszych wersjach Excela.","=INDEKS(C:C;PODAJ.POZYCJĘ(A2;A:A;0))","=INDEX(C:C,MATCH(A2,A:A,0))"],
  ["Wyszukiwanie","WYSZUKAJ.PIONOWO","VLOOKUP","Klasyczne wyszukiwanie; zawsze z dokładnym dopasowaniem (FAŁSZ).","=WYSZUKAJ.PIONOWO(A2;Cennik!A:C;3;FAŁSZ)","=VLOOKUP(A2,Cennik!A:C,3,FALSE)"],
  ["Sumowanie","SUMA.WARUNKÓW","SUMIFS","Suma z wieloma warunkami, np. sprzedaż klienta w miesiącu.","=SUMA.WARUNKÓW(Kwota;Klient;\"Alfa\";Data;\">=\"&DATA(2026;9;1))","=SUMIFS(Kwota,Klient,\"Alfa\",Data,\">=\"&DATE(2026,9,1))"],
  ["Sumowanie","SUMA.ILOCZYNÓW","SUMPRODUCT","Średnia ważona, np. marża ważona sprzedażą.","=SUMA.ILOCZYNÓW(B2:B20;C2:C20)/SUMA(B2:B20)","=SUMPRODUCT(B2:B20,C2:C20)/SUM(B2:B20)"],
  ["Sumowanie","LICZ.WARUNKI","COUNTIFS","Liczba pozycji spełniających warunki, np. faktur przeterminowanych.","=LICZ.WARUNKI(Termin;\"<\"&DZIŚ();Status;\"otwarta\")","=COUNTIFS(Termin,\"<\"&TODAY(),Status,\"otwarta\")"],
  ["Sumowanie","ŚREDNIA.WARUNKÓW","AVERAGEIFS","Średnia z warunkami.","=ŚREDNIA.WARUNKÓW(Dni;Klient;\"Alfa\")","=AVERAGEIFS(Dni,Klient,\"Alfa\")"],
  ["Tablice dynamiczne","UNIKATOWE","UNIQUE","Lista unikalnych wartości, np. kontrahentów.","=UNIKATOWE(A2:A500)","=UNIQUE(A2:A500)"],
  ["Tablice dynamiczne","FILTRUJ","FILTER","Wiersze spełniające warunek, np. faktury powyżej 15 000 zł.","=FILTRUJ(A2:D500;D2:D500>15000;\"brak\")","=FILTER(A2:D500,D2:D500>15000,\"brak\")"],
  ["Tablice dynamiczne","SORTUJ","SORT","Sortowanie zakresu formułą (np. malejąco po 2. kolumnie).","=SORTUJ(A2:B50;2;-1)","=SORT(A2:B50,2,-1)"],
  ["Tablice dynamiczne","SEKWENCJA","SEQUENCE","Ciąg liczb, np. 12 miesięcy.","=SEKWENCJA(12)","=SEQUENCE(12)"],
  ["Nowoczesne","LET","LET","Nazwy zmiennych w formule: czytelność i wydajność.","=LET(p;B2;k;C2;(p-k)/p)","=LET(p,B2,k,C2,(p-k)/p)"],
  ["Nowoczesne","LAMBDA","LAMBDA","Własna funkcja (Menedżer nazw), np. VAT.","=LAMBDA(netto;stawka;netto*stawka)","=LAMBDA(net,rate,net*rate)"],
  ["Błędy","JEŻELI.BŁĄD","IFERROR","Zamiana błędu na wartość.","=JEŻELI.BŁĄD(B2/C2;0)","=IFERROR(B2/C2,0)"],
  ["Logiczne","WARUNKI","IFS","Wiele warunków bez zagnieżdżania, np. przedziały wiekowania.","=WARUNKI(A2<=0;\"bieżące\";A2<=30;\"1-30\";A2<=90;\"31-90\";PRAWDA;\">90\")","=IFS(A2<=0,\"bieżące\",A2<=30,\"1-30\",A2<=90,\"31-90\",TRUE,\">90\")"],
  ["Daty","NR.SER.OST.DN.MIES.","EOMONTH","Ostatni dzień miesiąca, np. koniec okresu.","=NR.SER.OST.DN.MIES.(A2;0)","=EOMONTH(A2,0)"],
  ["Daty","NR.SER.DATY","EDATE","Data przesunięta o miesiące.","=NR.SER.DATY(A2;3)","=EDATE(A2,3)"],
  ["Daty","DNI.ROBOCZE","NETWORKDAYS","Dni robocze między datami (z listą świąt).","=DNI.ROBOCZE(A2;B2;Święta)","=NETWORKDAYS(A2,B2,Holidays)"],
  ["Daty","DZIEŃ.ROBOCZY","WORKDAY","Termin po N dniach roboczych.","=DZIEŃ.ROBOCZY(A2;10;Święta)","=WORKDAY(A2,10,Holidays)"],
  ["Daty","CZĘŚĆ.ROKU","YEARFRAC","Ułamek roku, np. do odsetek.","=CZĘŚĆ.ROKU(A2;B2;3)","=YEARFRAC(A2,B2,3)"],
  ["Daty","DATA.RÓŻNICA","DATEDIF","Różnica dat w dniach, miesiącach lub latach.","=DATA.RÓŻNICA(A2;B2;\"m\")","=DATEDIF(A2,B2,\"m\")"],
  ["Finansowe","NPV","NPV","Wartość bieżąca netto (przepływy od roku 1, nakład dodaj osobno).","=NPV(9%;C3:C9)+C2","=NPV(9%,C3:C9)+C2"],
  ["Finansowe","IRR","IRR","Wewnętrzna stopa zwrotu.","=IRR(C2:C9)","=IRR(C2:C9)"],
  ["Finansowe","XNPV","XNPV","NPV dla nieregularnych dat przepływów.","=XNPV(9%;C2:C9;B2:B9)","=XNPV(9%,C2:C9,B2:B9)"],
  ["Finansowe","PMT","PMT","Rata kredytu (stopa miesięczna).","=PMT(7,5%/12;60;-500000)","=PMT(7.5%/12,60,-500000)"],
  ["Finansowe","REGLINX","FORECAST","Prognoza liniowa na podstawie historii.","=REGLINX(13;B2:B13;A2:A13)","=FORECAST(13,B2:B13,A2:A13)"],
  ["Tekst","POŁĄCZ.TEKSTY","TEXTJOIN","Łączenie tekstów z separatorem.","=POŁĄCZ.TEKSTY(\", \";PRAWDA;A2:A10)","=TEXTJOIN(\", \",TRUE,A2:A10)"],
  ["Tekst","USUŃ.ZBĘDNE.ODSTĘPY","TRIM","Usuwa zbędne spacje z importu.","=USUŃ.ZBĘDNE.ODSTĘPY(A2)","=TRIM(A2)"],
  ["Tekst","PODSTAW","SUBSTITUTE","Zamiana znaków, np. kropki na przecinek.","=PODSTAW(A2;\".\";\",\")","=SUBSTITUTE(A2,\".\",\",\")"],
  ["Tekst","WARTOŚĆ","VALUE","Tekst na liczbę (po imporcie z banku).","=WARTOŚĆ(PODSTAW(A2;\" \";\"\"))","=VALUE(SUBSTITUTE(A2,\" \",\"\"))"],
  ["Tekst","TEKST","TEXT","Formatowanie liczby lub daty jako tekst.","=TEKST(A2;\"rrrr-mm\")","=TEXT(A2,\"yyyy-mm\")"],
  ["Zaokrąglenia","ZAOKR","ROUND","Zaokrąglenie do groszy (np. VAT).","=ZAOKR(B2*23%;2)","=ROUND(B2*23%,2)"]
];
reg({id:"tool-excel", a:"tool", kind:"lib", t:"Excel", min:15, d:"Biblioteka formuł finansisty po polsku i angielsku: wyszukiwanie, tablice dynamiczne, daty, NPV, IRR. Dodawaj własne.",
  render(root, s){
    s.own ||= [];
    root.innerHTML = `<div class="stack"><div class="row"><div class="field" style="flex:1 1 260px"><label for="xl_q">Szukaj formuły lub zadania</label><input id="xl_q" placeholder="np. suma warunkowa, ostatni dzień miesiąca, NPV"></div><div class="field" style="flex:0 1 200px"><label for="xl_lang">Wersja Excela</label><select id="xl_lang"><option value="pl">polska (średnik)</option><option value="en">angielska (przecinek)</option></select></div></div><div id="xl_list" class="stack"></div>
      <details class="info"><summary style="cursor:pointer;font-weight:600;color:var(--ink)">Dodaj własną formułę (zapamiętam ją)</summary><div class="row" style="margin-top:10px">${inp("xo_n", "Nazwa", "")}${inp("xo_d", "Do czego służy", "")}${inp("xo_f", "Formuła", "")}<button class="btn" type="button" id="xo_add">Dodaj</button></div></details></div>`;
    $("#xl_lang", root).value = s.lang || "pl";
    function draw(){
      const q = val(root, "xl_q").toLowerCase(), en = val(root, "xl_lang") === "en"; s.lang = en ? "en" : "pl"; persist();
      const all = [...s.own.map(o => ["Moje", o.n, o.n, o.d, o.f, o.f, true]), ...XL];
      const list = all.filter(x => !q || x.slice(0, 4).join(" ").toLowerCase().includes(q));
      $("#xl_list", root).innerHTML = list.length ? tableHTML([{l:"Kategoria"},{l:"Funkcja"},{l:"Zastosowanie"},{l:"Przykład"},{l:""}], list.map((x, i) => [`<span class="pill ${x[6] ? "learn" : ""}">${esc(x[0])}</span>`, `<b>${esc(en ? x[2] : x[1])}</b>${en || x[1] === x[2] ? "" : `<br><span class="hint">${esc(x[2])}</span>`}`, esc(x[3]), `<code style="font:12.5px var(--f-mono)">${esc(en ? x[5] : x[4])}</code>`, `<button class="btn sm" type="button" data-cp="${i}">Kopiuj</button>`])) : `<div class="empty">Brak wyników.</div>`;
      $$("[data-cp]", root).forEach(b => b.addEventListener("click", () => { copyText(en ? list[+b.dataset.cp][5] : list[+b.dataset.cp][4]); markUse("tool-excel"); }));
    }
    $("#xl_q", root).addEventListener("input", draw); $("#xl_lang", root).addEventListener("change", draw);
    $("#xo_add", root).addEventListener("click", () => { const n = val(root, "xo_n").trim(), f = val(root, "xo_f").trim(); if (!n || !f) { toast("Podaj nazwę i formułę."); return; } s.own.push({n, d: val(root, "xo_d"), f}); persist(); ["xo_n","xo_d","xo_f"].forEach(id => $("#" + id, root).value = ""); draw(); toast("Zapamiętano formułę."); });
    draw();
  }});
