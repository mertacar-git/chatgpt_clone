# ChatGPT Clone MVP (Next.js)

Bu proje, `chatgpt_clone.md` baz alinarak olusturulmus bir **Next.js App Router + TypeScript** MVP chat uygulamasidir.

## Ozellikler

- Tek sayfa chat arayuzu (`app/page.tsx`)
- API route uzerinden mesaj cevaplama (`app/api/chat/route.ts`)
- Bos mesaj engeli, loading durumu, temel hata yonetimi
- LLM entegrasyonuna hazir `.env` yapisi (MVP su anda fallback yanit doner)

## Gereksinimler

- Node.js 20+ (onerilen LTS)
- npm 10+

## Kurulum

```bash
npm install
```

## Ortam Degiskenleri

Ornek dosyayi kopyalayin:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Not: MVP su anda fallback yanit kullandigi icin API key zorunlu degildir.

## Gelistirme Modu

```bash
npm run dev
```

Tarayicida `http://localhost:3000` adresini acin.

## Production Build

```bash
npm run build
npm run start
```

## Proje Yapisi

- `app/page.tsx`: chat UI ve istemci state yonetimi
- `app/api/chat/route.ts`: `POST /api/chat` endpoint
- `app/globals.css`: temel stiller
- `.env.example`: gelecekteki model entegrasyonu icin ornek env

## GitHub Push Adimlari

Hedef repo: [mertacar-git/chatgpt_clone](https://github.com/mertacar-git/chatgpt_clone)

```bash
git init
git add .
git commit -m "Initial Next.js ChatGPT clone MVP"
git branch -M main
git remote add origin https://github.com/mertacar-git/chatgpt_clone.git
git push -u origin main
```

Eger `origin` zaten varsa:

```bash
git remote set-url origin https://github.com/mertacar-git/chatgpt_clone.git
git push -u origin main
```

## Sorun Giderme

- Port doluysa: `npm run dev -- -p 3001`
- Paket hatalarinda: `node_modules` ve lock dosyasini temizleyip tekrar `npm install`
- Build hatasinda: `npm run lint` ve TypeScript hatalarini duzeltin
