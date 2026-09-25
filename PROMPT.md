# Prompt projektowy (wersja profesjonalna)

Oryginalne polecenie przepisane na specyfikację, którą Claude wykonuje najdokładniej.

```xml
<rola>
Działasz jednocześnie jako: projektant produktu (UX), front-end developer, główny księgowy
i analityk finansowy FP&A z doświadczeniem na polskim rynku.
</rola>

<kontekst>
Źródło: infografika „Save 1hr per Day with Copilot in Finance” (Nicolas Boucher).
Zawiera 7 zespołów finansowych z 4 zadaniami każdy (analizy finansowe, podatki, budżetowanie
i prognozowanie, CFO, zobowiązania i należności, kontroler, audyt) oraz pierścień codziennych
czynności: zwiększanie produktywności, komunikacja z interesariuszami, plany efektywności
i samouczki narzędzi (Excel, PowerPoint, Outlook).
</kontekst>

<zadanie>
Zbuduj lekkie, codzienne narzędzie, które zamienia każdą pozycję z infografiki w gotowe
do uruchomienia zadanie dla Claude, w języku polskim.
</zadanie>

<wymagania>
1. Pełne tłumaczenie na polski i dopasowanie do polskich realiów (UoR, VAT, CIT, JPK, KSeF, MSSF).
2. Każde zadanie ma rolę eksperta, zmienne do wypełnienia, polecenie i format odpowiedzi.
   Prompt ma strukturę XML: rola, kontekst firmy, zadanie, tryb, dane, wymagania,
   preferencje, format.
3. Trzy tryby pracy: „zrób to za mnie”, „przewodnik krok po kroku”, „checklista”.
4. Nowości 2026: KSeF, raportowanie ESG (CSRD/ESRS), płynność 13-tygodniowa, wykrywanie anomalii,
   załączniki CSV/XLSX i zdjęcia faktur, uruchamianie bezpośrednio w Claude, streaming.
5. Samouczenie:
   a) profil firmy dołączany do każdego promptu,
   b) oceny i komentarze zamieniane przez Claude na krótkie reguły (globalne lub dla zadania),
   c) nauka z ręcznych poprawek odpowiedzi (porównanie wersji),
   d) zapamiętywanie wartości pól i podpowiedzi,
   e) ranking „Dla Ciebie” oparty na użyciu, ocenach i kalendarzu finansisty
      (zamknięcie miesiąca, JPK_V7, ZUS/PIT, sezon budżetowy, sprawozdania roczne),
   f) eksport i import pamięci.
6. Dwie wersje: skill dla Claude (SKILL.md z plikiem pamięci) i samodzielna strona HTML
   bez procesu budowania, działająca też na telefonie, w trybie jasnym i ciemnym.
7. Prywatność: dane zostają w przeglądarce, w pamięci nie zapisuje się haseł, numerów
   rachunków ani danych osobowych.
</wymagania>

<kryteria_akceptacji>
- Automatyczne testy end-to-end przechodzą (katalog, prompt, uruchomienie, nauka,
  trwałość pamięci, załączniki, eksport, widok mobilny, tryb ciemny, brak błędów JS).
- Narzędzie jest opublikowane i dostępne pod linkiem.
</kryteria_akceptacji>
```
