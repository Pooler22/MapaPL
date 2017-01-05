Mapa online Politechniki Łódzkiej

TODO:
 - [ ] aktualizacja danych
 - [ ] więcej informacji w dymku
 - [ ] więcej informacji dla budynku / miejsca
 - [ ] udostępnienie linku do danego miejsca / budynku

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


API (url query):
- Marked building:
  - `url/buildingId=id example: url/buildingId=1`
- Marked place:
  - `url/placeId=id example: url/buildingId=101`