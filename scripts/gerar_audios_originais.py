"""Original, offline instrumental audio for CalmTEA research prototype.
Entirely newly sequenced; SF2 TimGM6mb sounds from Debian package fluidsynth-soundfont-gm.
No externally copyrighted song or melody replicated.
"""
from pathlib import Path
import ctypes as C, heapq, subprocess, math, random, wave
import numpy as np
from scipy import signal

OUT=Path('/mnt/data/calmtea_work/public/audio'); OUT.mkdir(parents=True,exist_ok=True)
RATE=32000
lib=C.CDLL('libfluidsynth.so.3')
ptr=C.c_void_p
lib.new_fluid_settings.restype=ptr
lib.fluid_settings_setnum.argtypes=[ptr,C.c_char_p,C.c_double];lib.fluid_settings_setnum.restype=C.c_int
lib.fluid_settings_setint.argtypes=[ptr,C.c_char_p,C.c_int];lib.fluid_settings_setint.restype=C.c_int
lib.new_fluid_synth.argtypes=[ptr];lib.new_fluid_synth.restype=ptr
lib.fluid_synth_sfload.argtypes=[ptr,C.c_char_p,C.c_int];lib.fluid_synth_sfload.restype=C.c_int
lib.fluid_synth_program_change.argtypes=[ptr,C.c_int,C.c_int];lib.fluid_synth_program_change.restype=C.c_int
lib.fluid_synth_cc.argtypes=[ptr,C.c_int,C.c_int,C.c_int];lib.fluid_synth_cc.restype=C.c_int
lib.fluid_synth_noteon.argtypes=[ptr,C.c_int,C.c_int,C.c_int];lib.fluid_synth_noteon.restype=C.c_int
lib.fluid_synth_noteoff.argtypes=[ptr,C.c_int,C.c_int];lib.fluid_synth_noteoff.restype=C.c_int
lib.fluid_synth_write_s16.argtypes=[ptr,C.c_int,ptr,C.c_int,C.c_int,ptr,C.c_int,C.c_int];lib.fluid_synth_write_s16.restype=C.c_int
lib.delete_fluid_synth.argtypes=[ptr]
lib.delete_fluid_settings.argtypes=[ptr]

soundfont=b'/usr/share/sounds/sf2/TimGM6mb.sf2'
if not Path(soundfont.decode()).exists():raise RuntimeError('Missing compatible GM soundfont')

# (instrument preset, note/pattern). All song motifs original, not based on copyrighted recordings.
# GM program values are zero-indexed.
config={
'ambient': {'title':'Horizonte sereno','bpm':70,'seconds':65,'mode':'ambient','chords':[(48,52,55,59,62),(45,48,52,55,59),(41,45,48,52,57),(43,47,50,55,59)],'programs':{0:89,1:11,2:48}},
'piano':{'title':'Entre folhas','bpm':76,'seconds':65,'mode':'piano','chords':[(50,53,57,60),(46,50,53,57),(41,45,48,53),(48,52,55,60)],'programs':{0:0,1:48}},
'lofi':{'title':'Fim de tarde','bpm':78,'seconds':65,'mode':'lofi','chords':[(48,52,55,59),(45,48,52,55),(41,45,48,52),(43,47,50,53)],'programs':{0:4,1:33,2:11}},
'pop':{'title':'Luz do caminho','bpm':94,'seconds':65,'mode':'pop','chords':[(48,52,55),(43,47,50),(45,48,52),(41,45,48)],'programs':{0:24,1:38,2:80}},
'rock':{'title':'Passo leve','bpm':101,'seconds':65,'mode':'rock','chords':[(40,47,52),(36,43,48),(43,50,55),(38,45,50)],'programs':{0:27,1:29,2:33}},
'acustico':{'title':'Caminho de casa','bpm':84,'seconds':65,'mode':'acustico','chords':[(48,52,55,59),(45,48,52,55),(41,45,48,52),(43,47,50,55)],'programs':{0:25,1:73,2:42}},
'eletronico':{'title':'Brisa noturna','bpm':88,'seconds':65,'mode':'eletronico','chords':[(48,52,55,59),(43,47,50,55),(45,48,52,57),(41,45,48,52)],'programs':{0:88,1:80,2:38}},
}

def normalize_note(n):return int(max(0,min(127,n)))
def write_music(key, cfg):
    bpm=cfg['bpm'];beat=60/bpm; mode=cfg['mode']; seconds=cfg['seconds'];bar=beat*4
    ev=[];ind=0;random.seed(32+len(key))
    def note(at,ch,n,vel,dur):
        nonlocal ind
        if at>=seconds-1: return
        n=normalize_note(n); at=max(0.0,at); dur=max(0.04,min(dur,seconds-0.4-at))
        ev.append((int(at*RATE),ind,1,ch,n,int(max(1,min(127,vel)))));ind+=1
        ev.append((int((at+dur)*RATE),ind,0,ch,n,0));ind+=1
    bars=int(seconds/bar)+1
    for i in range(bars):
        at=i*bar;root,*others=cfg['chords'][i%len(cfg['chords'])]; chord=(root,*others)
        if mode=='ambient':
            for j,n in enumerate(chord):note(at+0.12*j,0,n,31 if j else 39,bar*1.45)
            for j,n in enumerate(chord[1:]):note(at+(j+0.5)*beat*0.95,1,n+12,36,beat*1.3)
            note(at+2*beat,2,root+24,26,beat*2)
        elif mode=='piano':
            arp=[0,2,1,3,2,1,0,2]
            for j,ix in enumerate(arp):note(at+j*beat/2,0,chord[ix]+(12 if j in [3,7] else 0),[56,46,49,38,52,43,49,42][j],beat*0.48)
            note(at+0.15,1,root-12,31,beat*3.5)
        elif mode=='lofi':
            for n in chord:note(at,0,n+12,53,bar*0.78)
            for q in [0,2]:note(at+q*beat,1,root-12,51,beat*0.7)
            for k in range(8):
                if random.random()>0.08:note(at+k*beat/2,9,42,24 if k%2 else 29,0.12)
            note(at,9,36,48,0.2);note(at+2*beat,9,38,35,0.16)
            note(at+beat*3,2,chord[2]+12,31,beat*0.9)
        elif mode=='pop':
            pattern=[0,1,2,1,0,2,1,2]
            for k in range(8):note(at+k*beat/2,0,chord[pattern[k]]+12,45,beat*0.33)
            for k in range(4):note(at+k*beat,1,root-12 if k%2==0 else root-5,56,beat*0.72)
            for k in range(8):note(at+k*beat/2,9,42,27,0.10)
            for k in [0,2]:note(at+k*beat,9,36,55,0.17)
            for k in [1,3]:note(at+k*beat,9,38,43,0.17)
            note(at+beat*3,2,chord[-1]+12,34,beat*0.8)
        elif mode=='rock':
            for k in range(8):
                n=chord[0] if k%4<2 else chord[1]
                note(at+k*beat/2,0,n+12,47 if k%2 else 59,beat*0.42)
            for n in chord[0:3]:note(at+beat*2,1,n+12,32,beat*1.4)
            for k in range(4):note(at+k*beat,2,root-12 if k%2==0 else root-5,61,beat*0.65)
            for k in range(8):note(at+k*beat/2,9,42,27,0.1)
            for k in [0,2]:note(at+k*beat,9,36,55,0.2)
            for k in [1,3]:note(at+k*beat,9,38,46,0.16)
        elif mode=='acustico':
            for k in range(8):note(at+k*beat/2,0,chord[[0,2,1,3,0,1,2,3][k]]+12,45 if k%2==0 else 38,beat*0.36)
            if i%2==0:note(at+beat*1.5,1,chord[-1]+12,36,beat*2.0)
            note(at+beat*0.5,2,root,28,beat*3)
        elif mode=='eletronico':
            for n in chord:note(at,0,n+12,41,bar*0.85)
            for k in range(8):note(at+k*beat/2,1,chord[k%len(chord)]+24,38 if k%2==0 else 31,beat*0.34)
            for k in range(4):note(at+k*beat,2,root-12,45,beat*0.6)
            for k in [0,2]:note(at+k*beat,9,36,44,0.15)
            for k in [1,3]:note(at+k*beat,9,38,32,0.15)
            for k in range(8):note(at+k*beat/2,9,42,21,0.09)
    ev.sort()
    settings=lib.new_fluid_settings()
    lib.fluid_settings_setnum(settings,b'synth.sample-rate',float(RATE))
    lib.fluid_settings_setnum(settings,b'synth.gain',0.22)
    lib.fluid_settings_setnum(settings,b'synth.reverb.level',0.35)
    lib.fluid_settings_setnum(settings,b'synth.reverb.room-size',0.6)
    lib.fluid_settings_setnum(settings,b'synth.chorus.level',0.14)
    synth=lib.new_fluid_synth(settings)
    if lib.fluid_synth_sfload(synth,soundfont,1)<0: raise RuntimeError('Cannot load soundfont')
    for ch,prog in cfg['programs'].items():lib.fluid_synth_program_change(synth,ch,prog)
    # softer drums and lower total gain
    lib.fluid_synth_cc(synth,9,7,46)
    for ch in cfg['programs']:lib.fluid_synth_cc(synth,ch,7,76)
    wav=OUT/(key+'.wav')
    with wave.open(str(wav),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE)
        pos=0;idx=0;target=int(seconds*RATE)
        while pos<target:
            next_ev=ev[idx][0] if idx<len(ev) else target
            if next_ev<=pos:
                while idx<len(ev) and ev[idx][0]<=pos:
                    _,__,on,ch,n,vel=ev[idx]; (lib.fluid_synth_noteon(synth,ch,n,vel) if on else lib.fluid_synth_noteoff(synth,ch,n));idx+=1
                continue
            n=min(4096,next_ev-pos,target-pos)
            buf=np.empty((n,2),dtype=np.int16)
            loc=buf.ctypes.data_as(ptr)
            lib.fluid_synth_write_s16(synth,n,loc,0,2,loc,1,2)
            w.writeframes(buf.tobytes());pos+=n
    lib.delete_fluid_synth(synth);lib.delete_fluid_settings(settings)
    mp3=OUT/(key+'.mp3')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af','loudnorm=I=-21:TP=-2:LRA=12','-ar','32000','-ac','2','-b:a','96k',str(mp3)],check=True)
    wav.unlink()
    print(cfg['title'],round(mp3.stat().st_size/1024),'KiB')

def nature(kind):
    seconds=62;n=RATE*seconds;rng=np.random.default_rng({'chuva':4,'mar':6,'floresta':8}[kind]);
    white=rng.standard_normal(n).astype(np.float32)
    if kind=='chuva':
        filt=signal.sosfilt(signal.butter(2,[650,6900],btype='bandpass',fs=RATE,output='sos'),white).astype(np.float32)
        signal_base=filt*0.15
        # sparse soft droplets, not hard pops
        for x in rng.integers(1000,n-7000,160):
            length=round(rng.uniform(.02,.12)*RATE)
            amp=rng.uniform(.005,.024)
            envelope=np.exp(-np.arange(length)/(RATE*0.021))
            tone=np.sin(2*np.pi*rng.uniform(350,900)*np.arange(length)/RATE)
            signal_base[x:x+length] += (amp*envelope*tone).astype(np.float32)
    elif kind=='mar':
        filt=signal.sosfilt(signal.butter(3,1600,fs=RATE,output='sos'),white).astype(np.float32)
        t=np.arange(n)/RATE
        slow=((np.sin(2*np.pi*t/9)+1)/2)**2
        signal_base=filt*(0.055+0.19*slow).astype(np.float32)
    else:
        filt=signal.sosfilt(signal.butter(3,2300,fs=RATE,output='sos'),white).astype(np.float32)
        t=np.arange(n)/RATE
        slow=.07+.012*np.sin(2*np.pi*t/11)
        signal_base=filt*slow
        for x in rng.integers(5000,n-7000,28):
            length=round(.15*RATE)
            tt=np.arange(length)/RATE
            f0=rng.uniform(800,1600)
            chirp=np.sin(2*np.pi*(f0*tt+240*tt**2))
            env=np.sin(np.pi*np.arange(length)/length)**2
            signal_base[x:x+length] += (0.018*chirp*env).astype(np.float32)
    fade=np.minimum(1.0,np.arange(n)/(RATE*1.8))*np.minimum(1.0,np.arange(n)[::-1]/(RATE*2.0))
    signal_base=(signal_base*fade).astype(np.float32)
    # stereo: gently delayed right channel
    stereo=np.column_stack([signal_base,np.roll(signal_base,90)*0.95]);stereo=np.clip(stereo,-0.9,0.9)
    raw=OUT/(kind+'.wav')
    with wave.open(str(raw),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE);w.writeframes((stereo*32767).astype('<i2').tobytes())
    mp3=OUT/(kind+'.mp3')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(raw),'-ar','32000','-ac','2','-b:a','80k',str(mp3)],check=True)
    raw.unlink()
    print(kind,round(mp3.stat().st_size/1024),'KiB')

for k,v in config.items():write_music(k,v)
for k in ['chuva','mar','floresta']:nature(k)
