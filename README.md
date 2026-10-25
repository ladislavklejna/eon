# 🔥 EON Topení - Moderní aplikace pro správu topení

Krásná, moderní React aplikace pro sledování a správu časového plánu topení EON s dynamickou konfigurací přes NAS server.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Ionic](https://img.shields.io/badge/Ionic-Ready-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed)

---

## ✨ Hlavní funkce

### 🎨 Moderní design
- **Glassmorphism efekty** s průhlednými prvky a blur efektem
- **Tmavý gradient pozadí** s ambient light efekty
- **Plně responzivní** - funguje na mobilu, tabletu i desktopu
- **Smooth animace** a transitions pro vylepšený UX

### 🔄 Dynamická konfigurace
- **Načítání z NAS serveru** - časové plány v jednoduchém JSON souboru
- **Automatická detekce aktualizací** - kontrola každých 5 minut
- **Notifikace o nových verzích** - elegantní upozornění na dostupnou aktualizaci
- **Offline režim** - funguje i bez serveru díky localStorage

### ⚙️ Pokročilé nastavení
- **Konfigurovatelná URL serveru** - nastavte si vlastní NAS
- **Status indikátor** - vidíte odkud se načítají data (Server/Lokální/Výchozí)
- **Kontrola verzí** - manuální i automatická kontrola aktualizací
- **Cache management** - možnost vymazat lokální cache

### 🌤️ Počasí
- **6 hodinová prognóza** s teplotou, vlhkostí a rychlostí větru
- **Moderní kartičky** s hover efekty
- **Real-time data** z open-meteo.com API

---

## 🚀 Rychlý start

### 1. Spuštění aplikace
```bash
cd eon
npm install
npm start
```
Aplikace se otevře na http://localhost:3000

### 2. Nastavení NAS serveru (Portainer + nginx)
Přečtěte si: **[PORTAINER_QUICKSTART.md](PORTAINER_QUICKSTART.md)** (5 minut)

### 3. Nastavení aplikace
1. Klikněte ⚙️ v pravém horním rohu
2. Zadejte URL: `http://192.168.1.100:8080/eon/eon-config.json`
3. Klikněte "Uložit URL" a "Zkontrolovat aktualizaci"

**Hotovo! 🎉**

---

## 📚 Dokumentace

### 🎯 Podle vašich potřeb:

| Chci... | Přečtěte |
|---------|----------|
| **Rychle spustit aplikaci** | [QUICKSTART.md](QUICKSTART.md) ⚡ |
| **Nastavit Portainer** | [PORTAINER_QUICKSTART.md](PORTAINER_QUICKSTART.md) 🐳 |
| **Detailní návod Portainer** | [PORTAINER_NGINX_SETUP.md](PORTAINER_NGINX_SETUP.md) 📖 |
| **Nastavit NAS bez Dockeru** | [NAS_SETUP.md](NAS_SETUP.md) 🏠 |
| **Rozumět aplikaci** | [README_IONIC.md](README_IONIC.md) 📱 |
| **Přehled všech souborů** | [FILES_OVERVIEW.md](FILES_OVERVIEW.md) 📁 |

---

## 🛠️ Technologie

- **React** 18.2.0 - UI framework
- **Ionic React** - Mobilní komponenty
- **Reactstrap** - Bootstrap 5 komponenty
- **React Icons** - Ikony
- **Capacitor** - Build pro mobil
- **nginx:alpine** - Web server v Dockeru
- **Portainer** - Docker management

---

## 🔄 Workflow aktualizace

### Půlhodinové intervaly

Plán může mít 18 položek po hodině (dosavadní formát), 36 položek po půlhodině od 6:00 nebo 48 položek po půlhodině přes celý den. Pořadí položek určuje čas a `id` uvádí začátek jako desetinné číslo. Například `8` znamená 8:00 a `8.5` znamená 8:30:

```json
{ "id": 8, "value": "ano" },
{ "id": 8.5, "value": "ne" },
{ "id": 9, "value": "ne" },
{ "id": 9.5, "value": "ano" }
```

Tím je topení vypnuté od 8:30 do 9:30. Plán musí mít stejný počet položek pro `weekday` i `weekend`; staré osmnáctipoložkové konfigurace zůstávají platné.

### Když chcete změnit časy (6× ročně):

1. **Editujte JSON na NAS:**
   ```bash
   nano /srv/eon/data/eon-config.json
   ```

2. **Změňte časy:**
   ```json
   { "id": 7, "value": "ne" }  // bylo "ano"
   ```

3. **Změňte verzi:**
   ```json
   "version": "2024-11-15T10:30:00Z"  // nový čas
   ```

4. **Uložte** → Aplikace automaticky detekuje změnu!

---

## 🎨 Přizpůsobení

### Změna barev
Upravte `src/App.css`:
```css
.App {
  --green: #22c55e;      /* Topí */
  --red: #ef4444;        /* Netopí */
  --accent: #38bdf8;     /* Akcentní */
}
```

---

## 🐛 Troubleshooting

### Aplikace nenačítá konfiguraci
1. Zkontrolujte URL v nastavení
2. Otevřete URL v prohlížeči - měli byste vidět JSON
3. Zkontrolujte konzoli (F12) pro chyby
4. Zkontrolujte logy v Portaineru

**Více řešení:** [PORTAINER_QUICKSTART.md](PORTAINER_QUICKSTART.md#-nejčastější-problémy)

---

## 📊 Status indikátory

| Indikátor | Význam |
|-----------|--------|
| 🟢 **Server** | Data načtena ze serveru (nejnovější) |
| 🟡 **Lokální** | Offline režim (poslední stažená verze) |
| ⚪ **Výchozí** | Výchozí data (nikdy se nepřipojilo) |

---

## 👨‍💻 Autor

Vytvořeno s ❤️ pomocí Claude Code

---

**Šťastné topení! 🔥**

---

# Původní Create React App dokumentace

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
