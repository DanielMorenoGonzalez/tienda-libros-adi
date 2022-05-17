### TESTING con POSTMAN
Aquí incluyo dos ficheros:
- *TiendaLibros.postman_collection.json* con todos los tests que se van a ejecutar. Ttambién se prueban posibles errores (p.ej. 404 al intentar obtener una categoría, 403 al añadir un libro, ...)
- *TiendaLibros.postman_test_run.json* en el que se muestran todos los detalles de los 79 tests pasados con éxito

**IMPORTANTE**: El test está pensado para ejecutarlo **UNA ÚNICA VEZ**. Lo ideal sería crear un script en el que se prepare y restaure la base de datos y así hacer las iteraciones que se deseen, pero por simplificar y la falta de tiempo se ha realizado de esta manera sólo para entender cómo funciona Postman

### DOCUMENTACIÓN con SWAGGER
Para poder hacer llamadas al API y ver la documentación del mismo, hay que acceder a [http://localhost:3000/api-docs](http://localhost:3000/api-docs)