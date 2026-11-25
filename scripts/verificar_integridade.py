#!/usr/bin/env python3
"""Testes estáticos reprodutíveis, sem instalar dependências."""
from pathlib import Path
import csv, re, hashlib
root=Path(__file__).resolve().parents[1]
app=(root/'src/App.tsx').read_text(encoding='utf-8')
registry=(root/'src/screenRegistry.ts').read_text(encoding='utf-8')
rows=list(csv.DictReader((root/'documentacao/HISTORIAS_V43_48_FRASES_IMUTAVEIS.csv').open(encoding='utf-8-sig',newline=''),delimiter=';'))
assert len(rows)==48 and len(set(x['identificador'] for x in rows))==48
assert all(app.count(x['texto_exato'])==1 for x in rows), 'Divergência literal em uma das histórias V43.'
assert len(set(re.findall(r'\bid:\s*"(T\d\d)"',registry)))==37, 'Inventário das 37 telas incompleto.'
assert len(set(re.findall(r'\bid:\s*"(Q\d\d)"',registry)))==35, 'Inventário Q01–Q35 incompleto.'
assert (root/'src/ozRemote.ts').is_file(), 'OP01 remoto não encontrado.'
assert 'joinOzSession' in app and 'sendEvent' in app, 'Interação remota ausente.'
audios=list((root/'public/audio').glob('*.mp3'))
assert len(audios)==10 and all(x.stat().st_size>10000 for x in audios), 'Biblioteca de MP3 incompleta.'
assert 'autoplay' not in app.lower(), 'Verificar reprodução automática indesejada.'
assert 'const cycle=elapsed%10' in app and 'breath-cycle__orb' in app, 'Guia automático de respiração ausente.'
assert '"portrait12"' in (root/'src/components.tsx').read_text(), 'Faltam variantes de retratos.'
assert len(list((root/'public/images/avatars').glob('portrait-*.webp')))==12, 'Retratos incompletos.'
assert all((root/'public/images/banners'/f).is_file() for f in ['pause.webp','music.webp']), 'Banners faltantes.'
assert all(f'{x}:' in app for x in ['pairs','path','guide','stories','outside']), 'Favoritos incompletos.'
assert 'mood-option__emoji' in app, 'Autorrelato sem emojis.'
assert 'storyMentorTips' in app, 'Orientações mentor ausentes.'
assert 'joinOzSession' in app and 'SIM_EVENTO_ACUSTICO' in app, 'OP01 alterado ou faltante.' 
assert 'Borracha' in app and 'Embaralhar e recomeçar' in app and 'path-svg' in app
assert 'from "./Illustrations"' in app and (root/'src/Illustrations.tsx').is_file()
assert 'import siteConfiguration from' not in (root/'vite.config.ts').read_text(), 'Build ainda importa .figma.'
print('OK: 37 telas, 35 cenários registrados, 48 frases V43 intactas, 10 MP3, 12 retratos, banners, favoritos e OP01 presentes.')
print('ATENÇÃO: este teste é estático; não substitui build Vite, testes no navegador e teste remoto.')
