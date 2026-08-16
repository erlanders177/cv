# Currículum vivo

Mi currículum y mis proyectos en un solo sitio, sincronizado automáticamente
con GitHub e incluyendo repositorios privados sin exponer su contenido.

- **El CV es la estructura**, los proyectos son la evidencia: cada habilidad
  que declaro viene acompañada de los repositorios que la respaldan.
- **Nada se publica sin que yo lo marque**: un repo aparece solo si le pongo el
  topic `portfolio` en GitHub.
- **Se actualiza solo**: una acción diaria lee GitHub, regenera los datos y el
  PDF, y despliega si algo cambió.

## Cómo decido qué se publica

En la página del repositorio en GitHub, junto a «About», añado topics:

| Topic                | Efecto                                              |
| -------------------- | --------------------------------------------------- |
| `portfolio`          | El proyecto aparece en el sitio                      |
| `portfolio-featured` | Además sale destacado en el currículum               |

Sin `portfolio` un repositorio no existe para el sitio. No hay lista de
exclusión que se pueda olvidar de actualizar: es opt-in puro.

Para afinar el texto, el orden o añadir cifras que la API no conoce, edito
[`content/projects.yaml`](content/projects.yaml).

### Repositorios privados

De un repo privado se publica **solo metadata**: nombre, descripción propia,
lenguajes, topics y fechas. Nunca la URL, la homepage ni el README. Además, el
sync **falla a propósito** si marco un repo privado sin escribirle antes un
título y un resumen a mano, para que su descripción cruda no acabe publicada
por accidente.

Advertencia consciente: el *nombre* del repositorio sí aparece en
`content/projects.yaml`. Si algún día el nombre delata a un cliente, hay que
renombrarlo en GitHub antes de marcarlo.

## Estructura

```
content/profile.yaml     El currículum. Fuente de verdad del sitio y del PDF.
content/projects.yaml    Ajustes por proyecto sobre lo que ya sabe GitHub.
data/*.generated.json    Salida del sync. Se commitea para poder revisarla.
src/lib/curate.ts        Único punto que decide qué se publica. Con tests.
src/lib/skills.ts        Cruza habilidades declaradas con repos reales.
scripts/sync-github.ts   Lee GitHub y escribe data/.
scripts/generate-pdf.ts  Imprime /cv-print a public/cv-{es,en}.pdf.
```

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # reglas de privacidad y de evidencia
npm run typecheck
```

Para sincronizar en local hace falta un token de acceso personal de GitHub con
permiso **Contents: read-only**:

```bash
GH_PAT=github_pat_… npm run sync
```

Imprime qué va a publicar antes de escribir nada, y conviene revisar el diff de
`data/projects.generated.json` antes de hacer push.

Para regenerar los PDF:

```bash
npm run build && npm run pdf
```

## Automatización

[`.github/workflows/sync.yml`](.github/workflows/sync.yml) se ejecuta cada día,
a mano desde la pestaña Actions, o por `repository_dispatch`. Ejecuta los tests
de privacidad **antes** de sincronizar: si alguno falla, no se publica nada.

El token vive en el secreto `GH_PAT` del repositorio y nunca llega al navegador:
el sitio es estático y no consulta a GitHub en tiempo de ejecución.

## Cambiar qué busco

Una línea en `content/profile.yaml`:

```yaml
status: encargos # encargos | ofertas | colaboraciones | no-disponible
```

Cambia el aviso de la cabecera y la llamada a la acción, en los dos idiomas.
