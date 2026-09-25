# Katalog zadań

Wygenerowano automatycznie z `app/godzina-finansisty.html` (`npm run katalog`). `{{zmienna}}` to dane od użytkownika.

## Zespół analiz finansowych

### Analiza trendów `fa-trend`

- **Opis:** Analiza trendów finansowych: zbieranie danych, techniki, wnioski. Oszczędność: ok. 25 min.
- **Rola:** starszy analityk finansowy FP&A
- **Zmienne:** `obszar` (Obszar analizy), `okres` (Okres), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Przeanalizuj trendy finansowe dla obszaru: {{obszar}} w okresie {{okres}}. Wskaż dynamikę r/r i m/m, sezonowość, punkty zwrotne i anomalie. Oddziel trend od zdarzeń jednorazowych. Zaproponuj 3–5 wskaźników wczesnego ostrzegania.
- **Format:** 1) Podsumowanie dla zarządu (3 zdania). 2) Tabela: wskaźnik | początek | koniec | zmiana % | CAGR | komentarz. 3) Obserwacje i hipotezy przyczyn. 4) Rekomendowane wykresy (typ, osie). 5) Następne kroki.

### Generowanie raportów `fa-report`

- **Opis:** Procedura przygotowania różnych typów raportów finansowych. Oszczędność: ok. 40 min.
- **Rola:** kierownik ds. raportowania zarządczego
- **Zmienne:** `typ` (Typ raportu: raport miesięczny (MBR) / raport kwartalny dla zarządu / pakiet dla rady nadzorczej / raport dla banku (kowenanty) / raport dla inwestorów), `okres` (Okres), `odbiorca` (Odbiorca), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Przygotuj {{typ}} za okres {{okres}} dla odbiorcy: {{odbiorca}}. Zaprojektuj strukturę, kluczowe metryki, komentarz zarządczy i listę kontroli jakości przed wysyłką.
- **Format:** Szkielet raportu z nagłówkami, tabele z danymi (brakujące oznacz [DO UZUPEŁNIENIA]), komentarz w układzie: co się stało, dlaczego, co dalej. Na końcu checklista QA.

### Research inwestycyjny `fa-invest`

- **Opis:** Ustrukturyzowana analiza potencjalnych okazji inwestycyjnych. Oszczędność: ok. 35 min.
- **Rola:** analityk inwestycyjny z certyfikatem CFA
- **Zmienne:** `inwestycja` (Inwestycja), `kwota` (Kwota), `horyzont` (Horyzont), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Oceń okazję inwestycyjną: {{inwestycja}}. Kwota: {{kwota}}, horyzont: {{horyzont}}. Zastosuj ramę: teza, rynek, przewagi konkurencyjne, finanse (NPV, IRR, okres zwrotu, wrażliwość), ryzyka, scenariusze wyjścia.
- **Format:** Karta inwestycji (one-pager), tabela wyceny z założeniami, macierz ryzyk (prawdopodobieństwo × wpływ), rekomendacja: inwestować / warunkowo / odrzucić, lista pytań do due diligence.

### Analiza scenariuszowa `fa-scen`

- **Opis:** Scenariusz bazowy, optymistyczny, pesymistyczny i stresowy z wpływem na wynik i gotówkę. Oszczędność: ok. 35 min.
- **Rola:** starszy analityk finansowy FP&A
- **Zmienne:** `temat` (Temat), `czynniki` (Kluczowe czynniki), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Zbuduj analizę scenariuszy (bazowy, optymistyczny, pesymistyczny, stresowy) dla: {{temat}}. Kluczowe czynniki: {{czynniki}}. Pokaż wpływ na przychody, EBITDA, przepływy pieniężne i płynność.
- **Format:** Tabela założeń per scenariusz, tabela wyników, analiza wrażliwości (opis wykresu tornado), wyzwalacze decyzji, plan działań na scenariusz pesymistyczny.

## Budżetowanie i prognozy

### Tworzenie budżetu `bud-create`

- **Opis:** Kompleksowy budżet krok po kroku, ze wszystkimi niezbędnymi elementami. Oszczędność: ok. 45 min.
- **Rola:** kierownik ds. budżetowania i kontrolingu
- **Zmienne:** `rodzaj` (Rodzaj budżetu: roczny operacyjny / kroczący (rolling forecast) / projektowy / budżet działu), `okres` (Okres), `jednostka` (Jednostka), `metoda` (Metoda: oparta na czynnikach (driver-based) / od zera (ZBB) / przyrostowa), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Przygotuj budżet ({{rodzaj}}) na {{okres}} dla: {{jednostka}}. Metoda: {{metoda}}. Obejmij przychody, koszty stałe i zmienne, wynagrodzenia, CAPEX, przepływy pieniężne i założenia makroekonomiczne.
- **Format:** Harmonogram prac budżetowych, struktura pliku (arkusze i kolumny), tabela założeń, szablon budżetu w tabeli Markdown, lista kontrolna zatwierdzenia.

### Analiza odchyleń `bud-var`

- **Opis:** Porównanie wykonania z budżetem: przyczyny, efekt ceny, wolumenu i struktury. Oszczędność: ok. 30 min.
- **Rola:** kontroler finansowy
- **Zmienne:** `okres` (Okres), `prog` (Próg istotności), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Przeprowadź analizę odchyleń wykonanie vs budżet za {{okres}}. Próg istotności: {{prog}}. Rozłóż odchylenia na efekt ceny, wolumenu i struktury tam, gdzie dane na to pozwalają. Oddziel przyczyny jednorazowe od trwałych.
- **Format:** Tabela: pozycja | budżet | wykonanie | odchylenie zł | odchylenie % | korzystne/niekorzystne | przyczyna | działanie. Komentarz zarządczy do 150 słów. Trzy najważniejsze działania korygujące.

### Modelowanie prognoz `bud-forecast`

- **Opis:** Ustrukturyzowane podejście do budowy modeli prognoz finansowych. Oszczędność: ok. 40 min.
- **Rola:** analityk FP&A i specjalista od modelowania finansowego
- **Zmienne:** `przedmiot` (Co prognozujemy), `horyzont` (Horyzont), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Zaprojektuj model prognozy: {{przedmiot}} na horyzont {{horyzont}}. Dobierz metodę (np. średnie ruchome, regresja, ETS, model oparty na czynnikach), uzasadnij wybór, opisz wymagane dane, walidację (MAPE, backtest) i sposób aktualizacji.
- **Format:** Architektura modelu (arkusze lub moduły), formuły Excel albo kod Python z komentarzami, tabela metryk dokładności, ograniczenia modelu.

### Płynność na 13 tygodni `bud-cash13` (nowość 2026)

- **Opis:** Kroczący 13-tygodniowy cash flow z sygnałami ostrzegawczymi. Oszczędność: ok. 40 min.
- **Rola:** skarbnik (treasury manager)
- **Zmienne:** `start` (Pierwszy tydzień), `saldo` (Saldo początkowe), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Zbuduj 13-tygodniową prognozę przepływów pieniężnych metodą bezpośrednią, od {{start}}. Saldo początkowe: {{saldo}}. Uwzględnij spływ należności według historycznego DSO, harmonogram zobowiązań, wynagrodzenia, terminy ZUS, PIT i VAT, raty kredytów oraz mechanizm podzielonej płatności.
- **Format:** Tabela tygodniowa (wpływy, wydatki, saldo, wymagane minimum), lista tygodni zagrożonych, działania zaradcze (faktoring, przesunięcie płatności, linia kredytowa).

### Analiza kosztów i korzyści `bud-cba`

- **Opis:** Procedura analizy kosztów i korzyści projektów oraz inicjatyw. Oszczędność: ok. 30 min.
- **Rola:** analityk finansowy ds. projektów inwestycyjnych
- **Zmienne:** `projekt` (Projekt), `naklady` (Nakłady), `stopa` (Stopa dyskontowa), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Wykonaj analizę kosztów i korzyści dla: {{projekt}}. Nakłady: {{naklady}}. Oszacuj korzyści ilościowe i jakościowe, NPV przy stopie {{stopa}}, IRR, okres zwrotu i próg rentowności. Pokaż wrażliwość na kluczowe założenia.
- **Format:** Tabela przepływów rok po roku, wskaźniki, analiza wrażliwości, rekomendacja z warunkami.

## CFO

### Planowanie strategiczne `cfo-strat`

- **Opis:** Finansowy plan strategiczny: założenia, elementy, kamienie milowe. Oszczędność: ok. 45 min.
- **Rola:** doświadczony dyrektor finansowy (CFO)
- **Zmienne:** `horyzont` (Horyzont), `cele` (Cele), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Opracuj finansowy plan strategiczny na {{horyzont}}. Cele firmy: {{cele}}. Obejmij ambicje finansowe, alokację kapitału, strukturę finansowania, inicjatywy, KPI, ryzyka i kamienie milowe.
- **Format:** Cele SMART, mapa inicjatyw, projekcja P&L i cash flow (wysoki poziom), struktura finansowania, harmonogram, ryzyka.

### Komunikacja finansowa `cfo-comm`

- **Opis:** Jasna i skuteczna komunikacja finansowa dla różnych interesariuszy. Oszczędność: ok. 20 min.
- **Rola:** CFO z doświadczeniem w relacjach inwestorskich
- **Zmienne:** `temat` (Temat), `odbiorca` (Odbiorca), `kanal` (Kanał: e-mail / prezentacja / list do inwestorów / komunikat wewnętrzny / szkic raportu bieżącego ESPI), `liczby` (Kluczowe liczby)
- **Zadanie:** Przygotuj komunikat finansowy: {{temat}} dla odbiorcy: {{odbiorca}}. Kanał: {{kanal}}. Kluczowe liczby: {{liczby}}. Dopasuj język do odbiorcy, zacznij od wniosku (zasada piramidy) i przewidź trudne pytania.
- **Format:** Gotowy tekst, 3 kluczowe przesłania, 5 trudnych pytań z odpowiedziami.

### Analiza M&A `cfo-ma`

- **Opis:** Lista kontrolna finansowego due diligence przy fuzjach i przejęciach. Oszczędność: ok. 45 min.
- **Rola:** partner ds. transakcji (M&A, due diligence)
- **Zmienne:** `transakcja` (Transakcja), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Przygotuj listę kontrolną i plan finansowego due diligence dla transakcji: {{transakcja}}. Uwzględnij jakość zysków (QoE), dług netto i pozycje dłużnopodobne, normalizację kapitału obrotowego, podatki, zobowiązania warunkowe, synergie i mechanizm ceny (locked box albo completion accounts).
- **Format:** Checklista (obszar | pytanie | dokument | priorytet), lista red flags, szkic struktury raportu DD, pytania do zarządu spółki przejmowanej.

### Wskaźniki efektywności `cfo-kpi`

- **Opis:** Systematyczne ustalanie i monitorowanie kluczowych wskaźników (KPI). Oszczędność: ok. 30 min.
- **Rola:** CFO i architekt systemów raportowania
- **Zmienne:** `jednostka` (Jednostka), `cel` (Cel strategiczny)
- **Zadanie:** Zaprojektuj system finansowych KPI dla: {{jednostka}}. Cel strategiczny: {{cel}}. Dla każdego wskaźnika podaj definicję, wzór, źródło danych, częstotliwość, właściciela, wartość docelową i próg alarmowy.
- **Format:** Tabela KPI, układ dashboardu (sekcje i wykresy), rytm przeglądów, pułapki (np. wskaźniki próżności).

## Podatki i strategia

### Wsparcie rozliczeń podatkowych `tax-filing`

- **Opis:** Kompleksowa checklista przygotowania i złożenia deklaracji. Oszczędność: ok. 30 min.
- **Rola:** doradca podatkowy
- **Zmienne:** `deklaracja` (Rozliczenie: JPK_V7M / JPK_V7K (VAT) / CIT-8 ze sprawozdaniem i JPK_CIT / CIT-8 i podatek minimalny / PIT-36 / PIT-36L / informacja o cenach transferowych (TPR-C)), `okres` (Okres), `podmiot` (Podmiot)
- **Zadanie:** Przygotuj listę kontrolną i harmonogram rozliczenia: {{deklaracja}} za {{okres}} dla podmiotu: {{podmiot}}. Uwzględnij terminy, wymagane dokumenty, typowe błędy, uzgodnienia z księgami (np. rejestry VAT vs JPK_V7 vs KSeF) i kroki weryfikacji przed wysyłką.
- **Format:** Checklista z polami [ ], tabela terminów (czynność | termin | odpowiedzialny), lista dokumentów, pułapki. Każdy termin oznacz jako do weryfikacji z aktualnym stanem prawnym.

### Research przepisów `tax-research`

- **Opis:** Ustrukturyzowane badanie przepisów i śledzenie zmian. Oszczędność: ok. 30 min.
- **Rola:** doradca podatkowy specjalizujący się w analizach prawnych
- **Zmienne:** `pytanie` (Pytanie)
- **Zadanie:** Zbadaj zagadnienie podatkowe: {{pytanie}}. Przedstaw podstawę prawną (ustawa, artykuł), interpretacje i orzecznictwo (zaznacz, kiedy nie masz pewności), stanowiska różnych stron i praktyczne wnioski. Wskaż, jak monitorować dalsze zmiany (Dziennik Ustaw, interpretacje KIS w systemie EUREKA, projekty na RCL).
- **Format:** Streszczenie, analiza, tabela: źródło | co stanowi | pewność (wysoka/średnia/niska), rekomendacja, lista źródeł do weryfikacji.

### Przygotowanie do kontroli `tax-audit`

- **Opis:** Przygotowanie do kontroli podatkowej, w tym organizacja dokumentów. Oszczędność: ok. 40 min.
- **Rola:** doradca podatkowy z doświadczeniem w postępowaniach kontrolnych
- **Zmienne:** `rodzaj` (Rodzaj: kontrola podatkowa (urząd skarbowy) / kontrola celno-skarbowa / czynności sprawdzające / wewnętrzny przegląd podatkowy), `zakres` (Zakres)
- **Zadanie:** Przygotuj plan przygotowania do: {{rodzaj}} w zakresie: {{zakres}}. Obejmij organizację dokumentów, pełnomocnictwa, harmonogram, obszary ryzyka, komunikację z organem oraz prawa i obowiązki podatnika.
- **Format:** Plan działań w fazach (przed, w trakcie, po), indeks dokumentów (struktura folderów), mapa ryzyk, wzór rejestru przekazanych dokumentów.

### Strategia podatkowa `tax-strategy`

- **Opis:** Opracowanie i udokumentowanie strategii podatkowej. Oszczędność: ok. 40 min.
- **Rola:** partner ds. doradztwa podatkowego
- **Zmienne:** `podmiot` (Podmiot), `cele` (Cele)
- **Zadanie:** Opracuj strategię podatkową dla: {{podmiot}}. Cele: {{cele}}. Przeanalizuj legalne opcje (np. ulga B+R, IP Box, estoński CIT, ulga na robotyzację, grupa VAT), wymogi MDR, klauzulę przeciwko unikaniu opodatkowania oraz obowiązek publikacji informacji o realizowanej strategii podatkowej (art. 27c ustawy o CIT), jeśli dotyczy.
- **Format:** Tabela opcji: rozwiązanie | warunki | szacowana korzyść | ryzyko | nakład pracy; mapa drogowa wdrożenia; szkic dokumentu strategii podatkowej.

### KSeF bez stresu `tax-ksef` (nowość 2026)

- **Opis:** Gotowość do KSeF, weryfikacja e-faktur, obieg i procedury awaryjne. Oszczędność: ok. 30 min.
- **Rola:** ekspert ds. Krajowego Systemu e-Faktur i integracji ERP
- **Zmienne:** `temat` (Temat: ocena gotowości firmy do KSeF / procedura obiegu faktur zakupowych z KSeF / procedura awaryjna i tryb offline / weryfikacja poprawności e-faktury (wklej XML) / szkolenie dla zespołu księgowości), `erp` (System ERP), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Pomóż w temacie KSeF: {{temat}}. Uwzględnij strukturę logiczną FA(3), uprawnienia i tokeny, tryby awaryjne i offline, obieg faktur zakupowych, integrację z systemem {{erp}} i kontrolę jakości danych. Zaznacz, które daty i wymogi trzeba potwierdzić w aktualnych komunikatach Ministerstwa Finansów.
- **Format:** Checklista, proces krok po kroku (kto, co, w jakim systemie), tabela ryzyk, FAQ dla zespołu.

## Zobowiązania i należności

### Przetwarzanie faktur `ap-invoice`

- **Opis:** Usprawnienie obiegu faktur i odczyt danych z faktury. Oszczędność: ok. 25 min.
- **Rola:** kierownik działu księgowości zobowiązań (AP)
- **Zmienne:** `zakres` (Zakres), `stan` (Stan obecny)
- **Zadanie:** Zaprojektuj usprawniony obieg faktur dla: {{zakres}}. Stan obecny: {{stan}}. Uwzględnij KSeF, dopasowanie trójstronne (zamówienie, przyjęcie, faktura), akceptacje według progów, białą listę VAT, podzieloną płatność i archiwizację. Jeśli załączono obraz lub treść faktury, wyodrębnij dane (sprzedawca, NIP, numer, daty, pozycje, netto, VAT, brutto, rachunek) i sprawdź ich spójność.
- **Format:** Proces docelowy krok po kroku, macierz akceptacji, KPI (czas cyklu, koszt obsługi faktury), checklista wdrożenia. Dla faktury: tabela danych i wykryte niezgodności.

### Przypomnienia o płatnościach `ap-remind`

- **Opis:** Sekwencja automatycznych przypomnień i wezwań do zapłaty. Oszczędność: ok. 15 min.
- **Rola:** specjalista ds. windykacji polubownej (credit controller)
- **Zmienne:** `klient` (Klient), `kwota` (Kwota zaległości), `dni` (Dni po terminie), `ton` (Ton: uprzejmy / stanowczy / ostateczne wezwanie)
- **Zadanie:** Przygotuj sekwencję przypomnień o płatności dla klienta: {{klient}}. Zaległość: {{kwota}}, dni po terminie: {{dni}}. Ton: {{ton}}. Uwzględnij odsetki za opóźnienie w transakcjach handlowych i rekompensatę za koszty odzyskiwania należności, jeśli to zasadne.
- **Format:** Trzy wiadomości (przed terminem, +7 dni, +21 dni) z tematami, szkic przedsądowego wezwania do zapłaty, reguły automatyzacji (warunek → akcja).

### Komunikacja z dostawcami `ap-vendor`

- **Opis:** Szablony wiadomości do dostawców w sprawie płatności. Oszczędność: ok. 10 min.
- **Rola:** kierownik ds. zobowiązań
- **Zmienne:** `dostawca` (Dostawca), `sprawa` (Sprawa: prośba o wydłużenie terminu płatności / korekta faktury / potwierdzenie salda / weryfikacja zmiany rachunku bankowego (ochrona przed oszustwem) / harmonogram spłaty), `szczegoly` (Szczegóły)
- **Zadanie:** Przygotuj wiadomość do dostawcy {{dostawca}} w sprawie: {{sprawa}}. Zachowaj dobre relacje, jasno podaj fakty, kwoty, oczekiwane działanie i termin. Szczegóły: {{szczegoly}}.
- **Format:** Gotowy e-mail (temat i treść), krótka wersja do Teams, checklista przed wysyłką.

### Pomoc w uzgodnieniach `ap-recon`

- **Opis:** Uzgadnianie rozrachunków, wyciągów i kont przejściowych. Oszczędność: ok. 35 min.
- **Rola:** starszy księgowy ds. rozrachunków
- **Zmienne:** `rodzaj` (Rodzaj uzgodnienia: saldo z kontrahentem / wyciąg bankowy vs księga / konto rozrachunkowe vs subkonta / konto przejściowe), `okres` (Okres), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Przeprowadź uzgodnienie: {{rodzaj}} za {{okres}}. Porównaj dostarczone zestawienia, dopasuj pozycje (kwota, data, numer dokumentu), wskaż różnice i ich prawdopodobne przyczyny (różnice kursowe, płatności w drodze, brak faktury, duplikaty).
- **Format:** Tabela dopasowań, tabela różnic z przyczyną i proponowanym księgowaniem, wzór potwierdzenia salda.

## Kontroler finansowy

### Nadzór nad księgą główną `ctl-gl`

- **Opis:** Utrzymanie i weryfikacja integralności księgi głównej. Oszczędność: ok. 35 min.
- **Rola:** główny księgowy
- **Zmienne:** `okres` (Okres), `erp` (System ERP)
- **Zadanie:** Przygotuj procedurę zamknięcia i przeglądu księgi głównej za {{okres}} w systemie {{erp}}. Obejmij kontrole kompletności, uzgodnienia kont, salda nietypowe, ręczne dekrety, rozliczenia międzyokresowe, rezerwy i różnice kursowe.
- **Format:** Checklista zamknięcia miesiąca (dzień D+1 do D+5, odpowiedzialny), lista testów analitycznych, wzór dziennika zmian.

### Monitorowanie zgodności `ctl-compliance`

- **Opis:** Checklista zgodności finansowej dopasowana do przepisów. Oszczędność: ok. 30 min.
- **Rola:** kontroler finansowy ds. zgodności
- **Zmienne:** `podmiot` (Podmiot), `obszary` (Obszary)
- **Zadanie:** Przygotuj listę kontrolną zgodności finansowej dla podmiotu: {{podmiot}}. Obszary: {{obszary}}.
- **Format:** Tabela: obowiązek | podstawa prawna | termin lub częstotliwość | właściciel | dowód wykonania | status [ ]; kalendarz roczny.

### Sprawozdawczość finansowa `ctl-report`

- **Opis:** Szablony sprawozdań i dobre praktyki zapewniające dokładność. Oszczędność: ok. 40 min.
- **Rola:** biegły rewident i ekspert sprawozdawczości
- **Zmienne:** `sprawozdanie` (Sprawozdanie: roczne sprawozdanie finansowe / sprawozdanie śródroczne / sprawozdanie skonsolidowane / pakiet raportowy dla grupy), `okres` (Okres), `standard` (Standard)
- **Zadanie:** Przygotuj szablon i procedurę sporządzenia: {{sprawozdanie}} za {{okres}} według: {{standard}}. Uwzględnij noty, informację dodatkową, sprawozdanie z działalności, terminy (sporządzenie, zatwierdzenie, złożenie do KRS) i kontrole spójności.
- **Format:** Struktura dokumentu, lista uzgodnień krzyżowych (bilans, RZiS, rachunek przepływów, zestawienie zmian w kapitale), harmonogram, checklista jakości.

### Raportowanie ESG `ctl-esg` (nowość 2026)

- **Opis:** CSRD i ESRS: podwójna istotność, wskaźniki, ślad węglowy. Oszczędność: ok. 40 min.
- **Rola:** ekspert ds. raportowania zrównoważonego rozwoju
- **Zmienne:** `element` (Element: analiza podwójnej istotności / mapa wskaźników i źródeł danych / obliczenie śladu węglowego (zakres 1–2) / harmonogram wdrożenia raportowania / szkic rozdziału raportu), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Pomóż przygotować: {{element}} dla spółki, która raportuje lub przygotowuje się do raportowania zrównoważonego rozwoju. Uwzględnij podwójną istotność, standardy ESRS (z uproszczeniami pakietu Omnibus, jeśli dotyczą; oznacz je do weryfikacji), emisje z zakresów 1–3 i powiązanie z danymi finansowymi.
- **Format:** Tabela tematów lub wskaźników, źródła danych i właściciele, luki, plan wdrożenia.

### Kontrola wewnętrzna `ctl-ic`

- **Opis:** Przegląd i wzmocnienie kontroli wewnętrznych. Oszczędność: ok. 35 min.
- **Rola:** kontroler finansowy i ekspert kontroli wewnętrznej
- **Zmienne:** `proces` (Proces)
- **Zadanie:** Oceń i wzmocnij kontrole wewnętrzne w procesie: {{proces}}. Opisz ryzyka (co może pójść źle), istniejące i brakujące kontrole (prewencyjne i detekcyjne, manualne i automatyczne), podział obowiązków i uprawnienia w systemie.
- **Format:** Macierz ryzyk i kontroli: ryzyko | kontrola | typ | częstotliwość | właściciel | dowód; luki i rekomendacje z priorytetem.

## Zespół audytu

### Ocena ryzyka `aud-risk`

- **Opis:** Kompleksowa ocena ryzyka finansowego krok po kroku. Oszczędność: ok. 35 min.
- **Rola:** kierownik audytu wewnętrznego
- **Zmienne:** `zakres` (Zakres), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Przeprowadź ocenę ryzyka finansowego dla: {{zakres}}. Obejmij ryzyko płynności, kredytowe, walutowe, stopy procentowej, operacyjne, nadużyć i regulacyjne. Oceń prawdopodobieństwo i wpływ w skali 1–5.
- **Format:** Rejestr ryzyk (tabela), opis mapy ciepła, pięć najważniejszych ryzyk z planem ograniczania, kluczowe wskaźniki ryzyka (KRI).

### Planowanie audytu `aud-plan`

- **Opis:** Planowanie i dokumentowanie audytów wewnętrznych. Oszczędność: ok. 35 min.
- **Rola:** kierownik audytu wewnętrznego (CIA)
- **Zmienne:** `obszar` (Obszar), `czas` (Czas)
- **Zadanie:** Zaplanuj audyt wewnętrzny obszaru: {{obszar}}. Czas na audyt: {{czas}}. Określ cel, zakres, kryteria, ryzyka, metodykę (wywiady, próby, analityka danych), zasoby i harmonogram.
- **Format:** Karta audytu, program audytu (krok | test | próba | dowód), harmonogram, lista dokumentów do przygotowania przez klienta (PBC).

### Testowanie kontroli `aud-test`

- **Opis:** Procedura testowania skuteczności kontroli finansowych. Oszczędność: ok. 30 min.
- **Rola:** audytor wewnętrzny
- **Zmienne:** `kontrola` (Kontrola)
- **Zadanie:** Zaprojektuj test skuteczności kontroli: {{kontrola}}. Określ test projektu i test działania, dobór próby (zależny od częstotliwości kontroli), atrybuty do sprawdzenia, kryteria oceny i dokumentację.
- **Format:** Arkusz testu (krok, atrybut, wynik), tabela wielkości prób, kryteria wyjątku, wzór wniosku z testu.

### Wykrywanie anomalii `aud-anom` (nowość 2026)

- **Opis:** Duplikaty, podział kwot, prawo Benforda i nietypowe płatności. Oszczędność: ok. 40 min.
- **Rola:** audytor śledczy (forensic) i analityk danych
- **Zmienne:** `progi` (Progi akceptacji), `dane` (Transakcje (CSV lub wklej))
- **Zadanie:** Przeanalizuj transakcje pod kątem anomalii i sygnałów nadużyć: duplikaty, kwoty tuż poniżej progów akceptacji ({{progi}}), płatności w weekendy, nowi dostawcy z dużymi kwotami, okrągłe kwoty, odchylenia od rozkładu Benforda, rachunki spoza białej listy VAT.
- **Format:** Tabela podejrzanych pozycji (id | reguła | uzasadnienie | poziom ryzyka), statystyki, zalecane dalsze testy, reguły do stałego monitoringu.

### Dokumentowanie ustaleń `aud-issue`

- **Opis:** Szablon dokumentowania ustaleń i rekomendacji z audytu. Oszczędność: ok. 20 min.
- **Rola:** audytor wewnętrzny
- **Zmienne:** `ustalenie` (Ustalenie)
- **Zadanie:** Udokumentuj ustalenie z audytu: {{ustalenie}}. Użyj struktury: stan faktyczny, kryterium, przyczyna, skutek, rekomendacja. Nadaj ocenę istotności.
- **Format:** Karta ustalenia, rekomendacja SMART, proponowana odpowiedź kierownictwa z terminem i właścicielem.

## Produktywność

### E-maile w kilka sekund `day-email`

- **Opis:** Gotowy e-mail z tematem i krótszą alternatywą. Oszczędność: ok. 10 min.
- **Rola:** doświadczony specjalista ds. finansów piszący zwięźle
- **Zmienne:** `adresat` (Adresat), `sprawa` (Sprawa), `punkty` (Kluczowe informacje), `ton` (Ton: rzeczowy / formalny / przyjazny)
- **Zadanie:** Napisz e-mail do: {{adresat}} w sprawie: {{sprawa}}. Kluczowe informacje: {{punkty}}. Ton: {{ton}}.
- **Format:** Temat i treść (do 150 słów) oraz krótsza wersja alternatywna.

### Korekta sformułowań `day-wording`

- **Opis:** Poprawa języka, jasności i tonu tekstu. Oszczędność: ok. 8 min.
- **Rola:** redaktor tekstów finansowych i biznesowych
- **Zmienne:** `cel` (Cel tekstu), `tekst` (Tekst do poprawy)
- **Zadanie:** Popraw poniższy tekst pod względem języka, jasności i profesjonalnego tonu. Zachowaj sens i wszystkie liczby. Cel tekstu: {{cel}}. Tekst: {{tekst}}
- **Format:** Wersja poprawiona, a pod nią do 5 najważniejszych zmian.

### Streszczenie dokumentu `day-summary`

- **Opis:** Streszczenie umowy, raportu lub protokołu z kluczowymi liczbami. Oszczędność: ok. 15 min.
- **Rola:** analityk finansowy przygotowujący notatki dla zarządu
- **Zmienne:** `odbiorca` (Odbiorca), `fokus` (Na czym się skupić), `tekst` (Treść dokumentu)
- **Zadanie:** Streść dokument (wklejony lub załączony) dla odbiorcy: {{odbiorca}}. Skup się na: {{fokus}}. Dokument: {{tekst}}
- **Format:** TL;DR w 2 zdaniach, tabela kluczowych liczb, decyzje i ryzyka, pytania otwarte.

### Wolne pytanie `day-ask`

- **Opis:** Dowolne pytanie z automatycznym kontekstem firmy i Twoimi regułami. Oszczędność: ok. 10 min.
- **Rola:** wszechstronny ekspert finansów, księgowości i podatków w Polsce
- **Zmienne:** `pytanie` (Twoje pytanie), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** {{pytanie}}
- **Format:** Odpowiedź dopasowana do pytania: najpierw konkretna odpowiedź, potem uzasadnienie.

## Komunikacja z interesariuszami

### Wytyczne budżetowe `stk-guide`

- **Opis:** Instrukcja budżetowa dla kierowników działów. Oszczędność: ok. 25 min.
- **Rola:** kierownik ds. budżetowania
- **Zmienne:** `okres` (Okres), `zalozenia` (Założenia)
- **Zadanie:** Przygotuj wytyczne budżetowe dla kierowników działów na {{okres}}: założenia makroekonomiczne, limity, terminy, format przekazania danych i zasady uzasadniania wydatków. Dodatkowe założenia: {{zalozenia}}.
- **Format:** Dokument gotowy do wysłania: wstęp, założenia (tabela), harmonogram, szablon zgłoszenia, FAQ.

### Prośba o dane `stk-input`

- **Opis:** Uprzejma i skuteczna prośba o przekazanie danych. Oszczędność: ok. 10 min.
- **Rola:** kontroler finansowy
- **Zmienne:** `kto` (Do kogo), `lista` (Jakie dane), `termin` (Termin), `format` (Format)
- **Zadanie:** Napisz prośbę do: {{kto}} o przekazanie danych: {{lista}} do {{termin}} w formacie: {{format}}. Wyjaśnij cel i konsekwencje opóźnienia.
- **Format:** E-mail z tematem, lista wymaganych danych w punktach, krótkie przypomnienie na dzień przed terminem.

### Przygotowanie spotkania `stk-meeting`

- **Opis:** Agenda, cele, materiały i szablon notatki. Oszczędność: ok. 15 min.
- **Rola:** CFO prowadzący efektywne spotkania
- **Zmienne:** `temat` (Temat), `uczestnicy` (Uczestnicy), `czas` (Czas)
- **Zadanie:** Przygotuj spotkanie: {{temat}}. Uczestnicy: {{uczestnicy}}. Czas: {{czas}}.
- **Format:** Agenda z czasem na punkt, cel i oczekiwane decyzje, materiały do przeczytania przed spotkaniem, szablon notatki i listy zadań.

## Plany efektywności

### Analiza sprzedaży `perf-sales`

- **Opis:** Struktura, rentowność i koncentracja sprzedaży. Oszczędność: ok. 30 min.
- **Rola:** analityk sprzedaży i rentowności
- **Zmienne:** `wymiar` (Przekrój), `okres` (Okres), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Przeanalizuj sprzedaż w przekroju: {{wymiar}} za {{okres}}. Oceń strukturę, rentowność, koncentrację klientów (Pareto, ABC), trendy i rabaty.
- **Format:** Kluczowe wnioski, tabele ABC, lista klientów lub produktów do działań, rekomendacje cenowe.

### Zarządzanie dostawcami `perf-vendor`

- **Opis:** Koncentracja, warunki płatności i negocjacje. Oszczędność: ok. 25 min.
- **Rola:** menedżer ds. zakupów i finansów
- **Zmienne:** `kategoria` (Kategoria), `dane` (Dane (wklej z Excela lub załącz plik))
- **Zadanie:** Oceń bazę dostawców w kategorii: {{kategoria}}. Przeanalizuj koncentrację, warunki płatności, ryzyko, możliwości negocjacji i konsolidacji.
- **Format:** Segmentacja dostawców, tabela ryzyk, plan negocjacji z celami (cena, termin płatności), szybkie wygrane.

### Usprawnianie procesów `perf-process`

- **Opis:** Lean, automatyzacja i AI w procesach finansowych. Oszczędność: ok. 30 min.
- **Rola:** konsultant ds. transformacji finansów
- **Zmienne:** `proces` (Proces), `problem` (Problem)
- **Zadanie:** Zaprojektuj usprawnienie procesu finansowego: {{proces}}. Obecny problem: {{problem}}. Wskaż marnotrawstwo (Lean), możliwości automatyzacji (RPA, integracje, API KSeF, bankowość API, AI) oraz wpływ na czas i koszt.
- **Format:** Mapa obecnego i docelowego procesu, lista usprawnień (wpływ | nakład | priorytet), plan na 30/60/90 dni.

## Samouczki narzędzi

### Excel `tool-excel`

- **Opis:** Formuły, Power Query, LAMBDA i Python w Excelu. Oszczędność: ok. 15 min.
- **Rola:** trener Excela dla działów finansowych
- **Zmienne:** `zadanie` (Co chcesz zrobić), `wersja` (Wersja: Microsoft 365 (polski) / Microsoft 365 (angielski) / Excel 2021 / Arkusze Google)
- **Zadanie:** Pokaż, jak w Excelu: {{zadanie}}. Wersja: {{wersja}}. Podaj gotowe formuły (polskie nazwy funkcji ze średnikiem i odpowiedniki angielskie) oraz alternatywy: tablice dynamiczne, LET/LAMBDA, Power Query, Python w Excelu, tabele przestawne.
- **Format:** Rozwiązanie krok po kroku, formuły w blokach kodu, typowe błędy, wariant zaawansowany.

### PowerPoint `tool-ppt`

- **Opis:** Struktura prezentacji finansowej slajd po slajdzie. Oszczędność: ok. 20 min.
- **Rola:** konsultant przygotowujący prezentacje dla zarządów
- **Zmienne:** `temat` (Temat), `odbiorca` (Odbiorca), `liczba` (Liczba slajdów)
- **Zadanie:** Zaprojektuj prezentację: {{temat}} dla: {{odbiorca}}, {{liczba}} slajdów. Zasada: jeden slajd to jedna teza z tytułem w formie wniosku.
- **Format:** Tabela: nr | tytuł-teza | treść | wizualizacja | notatki mówcy.

### Outlook `tool-outlook`

- **Opis:** Reguły, szybkie kroki, szablony i blokowanie czasu. Oszczędność: ok. 10 min.
- **Rola:** trener produktywności Microsoft 365
- **Zmienne:** `problem` (Problem)
- **Zadanie:** Pomóż zorganizować pracę w Outlooku: {{problem}}. Uwzględnij reguły, szybkie kroki, kategorie, szablony, planowanie wysyłki i blokowanie czasu na zamknięcie miesiąca.
- **Format:** Konfiguracja krok po kroku, gotowe reguły (warunek → akcja), tygodniowy rytm pracy.
