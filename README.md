Mapa online Politechniki Łódzkiej

TODO:
 - [ ] aktualizacja danych
 - [ ] więcej informacji w dymku
 - [ ] obsługa parametrów url
 - [ ] więcej informacji dla budynku / miejsca
 - [ ] udostępnienie linku do danego miejsca / budynku
 - [ ] stopka
 - [ ] bug z wysokością i szerokośćią strony

Data structure:

- category
  - id
  - name
  - short
  - short_name
  - subcategory
	
- place
  - id
  - name
  - short
  - category
  - building []
  - www
  - phone
	
- building
  - id
  - name
  - short 
  - longitude
  - latitude
  - address
  - photo


Data view:

- categories
  - places - building
  - subcategories
    - ...
  - buildings - places
