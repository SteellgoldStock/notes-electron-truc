# Electron — Fenêtre blanche (starter, corrigé)

Un point de départ minimal pour lancer une **fenêtre Electron** vide et y ajouter votre **HTML / CSS / JS**,
avec un chargement robuste de l'`index.html` en **développement** et **après packaging**.

## 1) Installation (une fois)
```bash
npm run setup
```

## 2) Lancer en développement
```bash
npm start
```

## 3) Packager (macOS/Windows/Linux selon votre OS)
```bash
npm run dist
```
Les artefacts seront générés dans `dist/` (`.dmg`, `.exe`, `.AppImage`, etc.).

## Où écrire mon code ?
- HTML : `src/renderer/index.html`
- CSS  : `src/renderer/styles.css`
- JS   : `src/renderer/renderer.js`

## Notes
- Les chemins dans `index.html` sont **relatifs** (pas de `/src/...`), ce qui évite l'erreur *Not allowed to load local resource* après packaging.
- Le build utilise `asar: true` pour un packaging propre.
