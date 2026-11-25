/** Biblioteca de áudio real, servida localmente pelo Vercel (public/audio).
 * Mídias instrumentais originais para demonstração; consulte public/audio/LICENCAS_E_FONTES.md.
 * Em nenhuma hipótese iniciar reprodução automaticamente.
 */
export const audioTracks = [
  { id: "chuva", title: "Chuva suave", category: "Ambientes", genre: "Natureza", author: "Trilha original CalmTEA", filename: "chuva.mp3", note: "Ruído delicado de chuva, sem vozes." },
  { id: "mar", title: "Ondas do mar", category: "Ambientes", genre: "Natureza", author: "Trilha original CalmTEA", filename: "mar.mp3", note: "Movimento contínuo e suave das ondas." },
  { id: "floresta", title: "Floresta tranquila", category: "Ambientes", genre: "Natureza", author: "Trilha original CalmTEA", filename: "floresta.mp3", note: "Som leve de natureza e pássaros discretos." },
  { id: "ambient", title: "Ambiente tranquilo — Horizonte sereno", category: "Músicas", genre: "Tranquila / ambient", author: "Trilha original CalmTEA", filename: "ambient.mp3", note: "Texturas instrumentais prolongadas, sem letra." },
  { id: "piano", title: "Entre folhas", category: "Músicas", genre: "Piano / clássica", author: "Trilha original CalmTEA", filename: "piano.mp3", note: "Melodia instrumental delicada ao piano." },
  { id: "lofi", title: "Fim de tarde", category: "Músicas", genre: "Lo-fi", author: "Trilha original CalmTEA", filename: "lofi.mp3", note: "Batida tranquila e piano elétrico." },
  { id: "pop", title: "Luz do caminho", category: "Músicas", genre: "Pop", author: "Trilha original CalmTEA", filename: "pop.mp3", note: "Pop instrumental leve, sem vocal." },
  { id: "rock", title: "Passo leve", category: "Músicas", genre: "Rock", author: "Trilha original CalmTEA", filename: "rock.mp3", note: "Rock instrumental moderado; escolha o que for confortável." },
  { id: "acustico", title: "Caminho de casa", category: "Músicas", genre: "Acústico", author: "Trilha original CalmTEA", filename: "acustico.mp3", note: "Cordas acústicas e melodia serena." },
  { id: "eletronico", title: "Brisa noturna", category: "Músicas", genre: "Eletrônica", author: "Trilha original CalmTEA", filename: "eletronico.mp3", note: "Arpejos eletrônicos suaves e repetitivos." },
] as const;
export type AudioTrack = (typeof audioTracks)[number];
export type AudioTrackId = AudioTrack["id"];
export function audioTrackById(id: string): AudioTrack {
  return audioTracks.find((track) => track.id === id) ?? audioTracks[0];
}
export function audioPath(track: AudioTrack): string { return `/audio/${track.filename}`; }
