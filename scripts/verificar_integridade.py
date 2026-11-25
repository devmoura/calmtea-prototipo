#!/usr/bin/env python3
"""Testes estáticos reprodutíveis, sem instalar dependências."""
from pathlib import Path
import csv, re, hashlib
root=Path(__file__).resolve().parents[1]
app=(root/'src/App.tsx').read_text(encoding='utf-8')
registry=(root/'src/screenRegistry.ts').read_text(encoding='utf-8')
rows=list(csv.DictReader((root/'documentacao/HISTORIAS_V43_48_FRASES_IMUTAVEIS.csv').open(encoding='utf-8-sig',newline=''),delimiter=';'))
assert len(rows)==48 and len(set(x['identificador'] for x in rows))==48
assert all(app.count(x['texto_exato'])==1 for x in rows if x['historia']!='HS03'), 'Divergência em histórias V43 que não foram revisadas.'
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
assert len(list((root/'public/images/support').glob('context-*.webp')))==8, 'Miniaturas contextuais incompletas.'
frustration_revision = [
    'Quando algo não acontece como eu esperava, posso sentir frustração.',
    'Isso pode acontecer diante de uma espera, uma mudança ou de uma dificuldade no dia a dia.',
    'Posso reconhecer o que me incomodou antes de decidir como agir.',
    'Uma pausa, um ambiente mais tranquilo ou uma conversa podem me ajudar a organizar o próximo passo.',
    'Depois de um intervalo, posso tentar outro caminho ou pedir ajuda.',
    'Não preciso resolver tudo de uma vez. Posso voltar ao assunto quando estiver em melhores condições.',
]
assert all(app.count(phrase) == 1 for phrase in frustration_revision), 'Uma das 6 frases revisadas de HS03 está ausente.'
context_suggestions = app.split('const byContext: Record<string, SupportSuggestion[]> = {', 1)[1].split('const matchingPersonalStrategy', 1)[0]
assert len(re.findall(r'\[\s*"História contextual"\s*,', context_suggestions)) == 8, 'Cada um dos 8 contextos precisa oferecer sua história.'
assert 'function suggestionThumbnail(' in app and 'src={suggestionThumbnail(title, state.context)}' in app, 'Miniaturas não conectadas às sugestões.'
print('OK: 37 telas, 35 cenários, 42 frases V43 preservadas e 6 da frustração revisadas, 8 miniaturas, 10 MP3, 12 retratos, favoritos e OP01.')
print('ATENÇÃO: este teste é estático; não substitui build Vite, testes no navegador e teste remoto.')
