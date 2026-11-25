# CalmTEA — documentação da biblioteca sonora

Arquivos MP3 locais gerados exclusivamente para esta versão do protótipo (novembro de 2026).

## Música e ambientes

- Música **Horizonte sereno** (`ambient.mp3`): composição instrumental original, ambient.
- Música **Entre folhas** (`piano.mp3`): composição instrumental original, piano.
- Música **Fim de tarde** (`lofi.mp3`): composição instrumental original, lo-fi.
- Música **Luz do caminho** (`pop.mp3`): composição instrumental original, pop leve.
- Música **Passo leve** (`rock.mp3`): composição instrumental original, rock moderado.
- Música **Caminho de casa** (`acustico.mp3`): composição instrumental original, acústico/folk.
- Música **Brisa noturna** (`eletronico.mp3`): composição instrumental original, eletrônico leve.
- **Chuva suave** (`chuva.mp3`), **Ondas do mar** (`mar.mp3`) e **Floresta tranquila** (`floresta.mp3`): paisagens sonoras sintetizadas matematicamente, não gravações de campo.

## Aviso de licenciamento

As melodias foram compostas para este protótipo, sem copiar gravações comerciais.
Para o timbre instrumental, os arquivos foram **renderizados usando o SoundFont TimGM6mb.sf2**, de Tim Brechbill (2004) e David Bolton (2010), disponibilizado sob **GNU GPL v2** pelo pacote Debian `timgm6mb-soundfont`. O instrumento de síntese foi FluidSynth (software livre). **Não representar essas faixas como CC0 ou como gravações de terceiros CC0.** A redistribuição e eventuais derivados dos samples devem respeitar os termos aplicáveis do SoundFont GPL-2. Para publicação sob outra licença, substituir os timbres por samples com licença adequada ou obter a autorização necessária.

Origem e licença da biblioteca de timbres:
- https://packages.debian.org/search?keywords=timgm6mb-soundfont
- https://github.com/musescore/musescore-old/commit/90c33ef9d87b3f5ff92efd3b07d89eb455fb1fef
- https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

As três paisagens sonoras foram criadas com filtros digitais e sinais matemáticos originais, sem samples externos.

## Uso no protótipo

- Todos os arquivos são locais (`public/audio/`), sem depender de serviços de streaming.
- Nenhuma faixa inicia automaticamente. O usuário controla reprodução, pausa, parada, progresso, volume e favoritos.
- Gênero musical é uma preferência, não uma indicação clínica nem garantia de efeito calmante.
- Para acessibilidade sensorial, sempre existe a opção de permanecer em silêncio.

## Catálogo externo de possíveis faixas CC0 para expansão futura

**Não incorporadas neste pacote, pois não foi possível baixar os arquivos externos durante a edição.** Cada página abaixo identifica o arquivo e a licença CC0; não atribuir a essas faixas os MP3 originais locais acima.

- Ambient: https://commons.wikimedia.org/wiki/File:Komiku_-_08_-_Ambiant_Truth.ogg
- Lo-fi: https://commons.wikimedia.org/wiki/File:Chill_Beat.ogg
- Pop: https://commons.wikimedia.org/wiki/File:Synth_pop_with_4_on_the_floor.ogg
- Rock: https://commons.wikimedia.org/wiki/File:Monplaisir_-_22_-_Rock_Alternatif_de_haute_qualit.ogg
