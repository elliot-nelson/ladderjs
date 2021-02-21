!function(){"use strict";const PLAY_SPEEDS=[120,100,90,50,30],Viewport={init(){Viewport.canvas=document.getElementById("canvas"),Viewport.ctx=Viewport.canvas.getContext("2d"),Viewport.resize(!0)},resize(force){let dpi=window.devicePixelRatio,width=Viewport.canvas.clientWidth,height=Viewport.canvas.clientHeight,dpiWidth=width*dpi,dpiHeight=height*dpi;(force||Viewport.canvas.width!==dpiWidth||Viewport.canvas.height!==dpiHeight)&&(Viewport.canvas.width=dpiWidth,Viewport.canvas.height=dpiHeight,Viewport.scale=(10*Math.min(dpiWidth/2592,dpiHeight/1600)|0)/10,Viewport.width=Math.ceil(dpiWidth/Viewport.scale),Viewport.height=Math.ceil(dpiHeight/Viewport.scale),Viewport.center={u:Viewport.width/2|0,v:Viewport.height/2|0},Viewport.clientWidth=width,Viewport.clientHeight=height,Viewport.ctx.imageSmoothingEnabled=!1),Viewport.canvas.style.cursor="not-allowed"}};function rgba(r,g,b,a){return`rgba(${r},${g},${b},${a})`}function createCanvas(width,height){let canvas=document.createElement("canvas");canvas.width=width,canvas.height=height;let ctx=canvas.getContext("2d");return{canvas:canvas,ctx:ctx}}const SpriteSheet_font2=[[0,0,128,512]],SpriteSheet_uri="sprites.png",Sprite={loadSpritesheet(cb){let image=new Image;image.onload=cb,image.src=SpriteSheet_uri,Sprite.sheet=image},init(){var data,anchor;Sprite.font=(data=SpriteSheet_font2[0],function(source,anchor){let w=source.width,h=source.height;return{img:source,anchor:anchor&&anchor.x?anchor:{x:w/2|0,y:h/2|0}}}(function(x,y,w,h){const source=Sprite.sheet,sliceCanvas=createCanvas(w,h);return sliceCanvas.ctx.drawImage(source,x,y,w,h,0,0,w,h),sliceCanvas.canvas}(...data),anchor))},drawSprite(ctx,sprite,u,v){ctx.drawImage(sprite.img,u-sprite.anchor.x,v-sprite.anchor.y)},drawViewportSprite(sprite,pos,rotation){let{u:u,v:v}=this.viewportSprite2uv(sprite,pos);rotation?(Viewport.ctx.save(),Viewport.ctx.translate(u+sprite.anchor.x,v+sprite.anchor.y),Viewport.ctx.rotate(rotation),Viewport.ctx.drawImage(sprite.img,-sprite.anchor.x,-sprite.anchor.y),Viewport.ctx.restore()):Viewport.ctx.drawImage(sprite.img,u,v)},viewportSprite2uv:(sprite,pos)=>({u:pos.x-sprite.anchor.x-Game.camera.pos.x+Viewport.center.u,v:pos.y-sprite.anchor.y-Game.camera.pos.y+Viewport.center.v})};const Action={UP:11,DOWN:12,LEFT:13,RIGHT:14,JUMP:15,STOP:16,PAUSE:17,RESUME:18},Input={Action:Action,KeyMapping:{KeyW:Action.UP,KeyS:Action.DOWN,KeyA:Action.LEFT,KeyD:Action.RIGHT,ArrowUp:Action.UP,ArrowDown:Action.DOWN,ArrowLeft:Action.LEFT,ArrowRight:Action.RIGHT,Space:Action.JUMP,Escape:Action.PAUSE,Enter:Action.RESUME},init(){this.buffer=[],this.history=[],window.addEventListener("keydown",event=>{let entry={at:(new Date).getTime(),key:event.key,code:event.code,action:Input.KeyMapping[event.code]||Input.Action.STOP};Input.buffer.push(entry),Input.history.push(entry),console.log(entry)})},update(){let now=(new Date).getTime();this.history=this.history.filter(entry=>entry.at>now-3e3)},lastKey(){return this.buffer.length>0?this.buffer[this.buffer.length-1].key:""},lastAction(){return this.buffer.length>0?this.buffer[this.buffer.length-1].action:void 0},consume(clearHistory){this.buffer=[],clearHistory&&(this.history=[])}},UNICODE_CHAR_MAP=["─│┌┐└┘├┤┬┴┼╳╳╳╳╳","═║╔╗╚╝╠╣╦╩╬╳╳╳╳╳","↑↓←→╳╳╳╳╳╳╳╳╳╳╳╳"].join("").split("").reduce((map,char,idx)=>(map[char]=128+idx,map),{}),Text={init(){Text.white={img:Sprite.font.img,scale:1,border:0,margin:0},Text.terminal=recolor(Text.white,rgba(67,255,16,1)),Text.terminal_shadow=recolor(Text.white,rgba(51,255,0,.4)),Text.glow=function(font,glow,scale,border,margin){let cols=font.img.width/8,rows=font.img.height/16,temp=createCanvas(8,16),canvas=createCanvas(cols*(8+border)*scale,rows*(16+border)*scale);for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)temp.ctx.clearRect(0,0,8,16),temp.ctx.drawImage(glow.img,8*x,16*y,8,16,0,0,8,16),canvas.ctx.drawImage(temp.canvas,0,0,8,16,x*(8+border)*scale+margin,y*(16+border)*scale,8*scale,16*scale),canvas.ctx.drawImage(temp.canvas,0,0,8,16,x*(8+border)*scale,y*(16+border)*scale+margin,8*scale,16*scale),canvas.ctx.drawImage(temp.canvas,0,0,8,16,x*(8+border)*scale+2*margin,y*(16+border)*scale+margin,8*scale,16*scale),canvas.ctx.drawImage(temp.canvas,0,0,8,16,x*(8+border)*scale+margin,y*(16+border)*scale+2*margin,8*scale,16*scale),temp.ctx.clearRect(0,0,8,16),temp.ctx.drawImage(font.img,8*x,16*y,8,16,0,0,8,16),canvas.ctx.drawImage(temp.canvas,0,0,8,16,x*(8+border)*scale+margin,y*(16+border)*scale+margin,8*scale,16*scale);return{img:canvas.canvas,scale:scale,border:border,margin:margin}}(Text.terminal,Text.terminal_shadow,4,2,2)},drawText(ctx,text,u,v,font=Text.terminal){let{img:img,scale:scale,border:border,margin:margin}=font;if(Array.isArray(text))for(let block of text)Text.drawText(ctx,block.text,u+block.u*scale,v+block.v*scale,font);else for(let idx=0;idx<text.length;idx++){let c=UNICODE_CHAR_MAP[text[idx]]||text.charCodeAt(idx),k=(c-0)*(8+border);32!==c&&ctx.drawImage(img,k*scale%img.width,Math.floor(k*scale/img.width)*(16+border)*scale,8*scale,16*scale,u+margin,v+margin,8*scale,16*scale),u+=8*scale}},measureWidth:(text,scale=1)=>text.split("").reduce((sum,c)=>sum+8,0)*scale,splitParagraph(text,w,h){let cu=0,cv=0,next=()=>({text:"",u:cu,v:cv}),wip=next(),list=[];for(let c of text.split("")){let cWidth=Text.measureWidth(c,1);if("\n"===c||cu+cWidth>w){let saved="";if("\n"!==c&&" "!==c){let space=wip.text.split(" ");space.length>1&&(saved=space.pop(),wip.text=space.join(" "))}wip.text.length>0&&list.push(wip),cu=0,cv+=16,wip=next(),saved.length>0&&(wip.text=saved,cu+=Text.measureWidth(wip.text,1))}else cu+=cWidth;"\n"!==c&&(wip.text=wip.text+c)}return wip.text.length>0&&list.push(wip),list.map(line=>({...line,w:Text.measureWidth(line.text,1),h:16}))}};function recolor(font,color){let canvas=createCanvas(font.img.width,font.img.height);return canvas.ctx.fillStyle=color,canvas.ctx.fillRect(0,0,font.img.width,font.img.height),canvas.ctx.globalCompositeOperation="destination-in",canvas.ctx.drawImage(font.img,0,0),{...font,img:canvas.canvas}}const zzfx=(...t)=>zzfxP(zzfxG(...t)),zzfxP=(...t)=>{let e=zzfxX.createBufferSource(),f=zzfxX.createBuffer(t.length,t[0].length,zzfxR);return t.map((d,i)=>f.getChannelData(i).set(d)),e.buffer=f,e.connect(zzfx.destination_),e.start(),e},zzfxG=(q=1,k=.05,c=220,e=0,t=0,u=.1,r=0,F=1,v=0,z=0,w=0,A=0,l=0,B=0,x=0,G=0,d=0,y=1,m=0,C=0)=>{let p,h,b=2*Math.PI,H=v*=500*b/zzfxR**2,I=(0<x?1:-1)*b/4,D=c*=(1+2*k*Math.random()-k)*b/zzfxR,Z=[],g=0,E=0,a=0,n=1,J=0,K=0,f=0;for(z*=500*b/zzfxR**3,x*=b/zzfxR,w*=b/zzfxR,A*=zzfxR,l=zzfxR*l|0,h=(e=99+zzfxR*e)+(m*=zzfxR)+(t*=zzfxR)+(u*=zzfxR)+(d*=zzfxR)|0;a<h;Z[a++]=f)++K%(100*G|0)||(f=r?1<r?2<r?3<r?Math.sin((g%b)**3):Math.max(Math.min(Math.tan(g),1),-1):1-(2*g/b%2+2)%2:1-4*Math.abs(Math.round(g/b)-g/b):Math.sin(g),f=(l?1-C+C*Math.sin(2*Math.PI*a/l):1)*(0<f?1:-1)*Math.abs(f)**F*q*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-y):a<e+m+t?y:a<h-d?(h-a-d)/u*y:0),f=d?f/2+(d>a?0:(a<h-d?1:(h-a)/d)*Z[a-d|0]/2):f),p=(c+=v+=z)*Math.sin(E*x-I),g+=p-p*B*(1-1e9*(Math.sin(a)+1)%2),E+=p-p*B*(1-1e9*(Math.sin(a)**2+1)%2),n&&++n>A&&(c+=w,D+=w,n=0),!l||++J%l||(c=D,v=H,n=n||1);return Z},zzfxV=.3,zzfxR=44100,zzfxX=new(top.AudioContext||webkitAudioContext);zzfx.destination_=zzfxX.destination;const ObliqueMystique=[[[1.3,0,23,,,.2,3,5],[1.5,0,4e3,,,.03,2,1.25,,,,,.02,6.8,-.3,,.5],[.7,0,2100,,,.2,3,3,,,-400,,,2],[,0,655,,,.11,2,1.65,,,,,,3.8,-.1,.1]],[[[,-.5,13,,,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,14,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,14,,,,],[1,.3,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,],[2,1,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,],[,.6,,,,,13,,18,,19,,,,,,,,19,,18,,,,16,,,,13,,,,,,,,,,13,,18,,19,,,,,,,,18,19,18,,,,13,14,13,,16,,18,,19,,],[3,-1,,,13,,,,,,,,,,,,13,,,,,,,,,,,,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,,,13,13,13,13]],[[,-.5,13,,,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,14,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,,,13,,,,14,,,,],[1,.3,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,,,13,,13,,13,,13,,13,,],[2,1,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,,,,,,,,,13,,,,,,,,,,,,13,,,,,,,,,,,,]]],[1,1,0,0,0,0,1,0],,],Audio={init(){Audio.readyToPlay=!1,Audio.ctx=zzfxX,Audio.gain_=Audio.ctx.createGain(),Audio.gain_.connect(Audio.ctx.destination),zzfx.destination_=Audio.gain_,Audio.shotgun=[,.01,140,.01,.02,.45,4,2.42,.1,-.1,,,,1.2,,.3,.04,.8,.02],Audio.page=[,,1233,,.01,.2,1,1.43,,,539,.1,,,,,,.51,.03,.01],Audio.shellReload=[,,68,.01,,.14,1,1.53,7.5,.1,50,.02,-.01,-.2,.1,.2,,.47,.01],Audio.damage=[,,391,,.19,.01,2,.54,-4,20,,,,,,,.02,.9],Audio.alarm=[,,970,.12,.25,.35,,.39,8.1,,10,.1,.2,,.1,,,.6,.09,.13],Audio.victory=[,,454,.06,.86,.71,2,.63,-.7,1.7,-83,.09,.27,.3,.2,,.18,.95,.02,.02],Audio.song=((instruments,patterns,sequence,BPM=125)=>{let instrumentParameters,i,j,k,note,sample,patternChannel,notFirstBeat,stop,instrument,pitch,attenuation,outSampleOffset,sampleOffset,nextSampleOffset,panning,sampleBuffer=[],leftChannelBuffer=[],rightChannelBuffer=[],channelIndex=0,hasMore=1,sampleCache={},beatLength=zzfxR/BPM*60>>2;for(;hasMore;channelIndex++)sampleBuffer=[hasMore=notFirstBeat=pitch=outSampleOffset=0],sequence.map((patternIndex,sequenceIndex)=>{for(patternChannel=patterns[patternIndex][channelIndex]||[0,0,0],hasMore|=!!patterns[patternIndex][channelIndex],nextSampleOffset=outSampleOffset+(patterns[patternIndex][0].length-2-!notFirstBeat)*beatLength,i=2,k=outSampleOffset;i<patternChannel.length+(sequenceIndex==sequence.length-1);notFirstBeat=++i){for(note=patternChannel[i],stop=instrument!=(patternChannel[0]||0)|note|0,j=0;j<beatLength&&notFirstBeat;j++>beatLength-99&&stop?attenuation+=(attenuation<1)/99:0)sample=(1-attenuation)*sampleBuffer[sampleOffset++]/2||0,leftChannelBuffer[k]=(leftChannelBuffer[k]||0)+sample*panning-sample,rightChannelBuffer[k]=(rightChannelBuffer[k++]||0)+sample*panning+sample;note&&(attenuation=note%1,panning=patternChannel[1]||0,(note|=0)&&(sampleBuffer=sampleCache[[instrument=patternChannel[sampleOffset=0]||0,note]]=sampleCache[[instrument,note]]||(instrumentParameters=[...instruments[instrument]],instrumentParameters[2]*=2**((note-12)/12),zzfxG(...instrumentParameters))))}outSampleOffset=nextSampleOffset});return[leftChannelBuffer,rightChannelBuffer]})(...ObliqueMystique)},update(){Audio.readyToPlay&&(Audio.musicPlaying||(Audio.musicPlaying=!0))},play(sound){Audio.readyToPlay&&zzfx(...sound)},pause(){Audio.gain_.gain.linearRampToValueAtTime(0,Audio.ctx.currentTime+1)},unpause(){Audio.gain_.gain.linearRampToValueAtTime(1,Audio.ctx.currentTime+1)}},Screen={init(){this.screen=[];for(let y=0;y<24;y++)this.screen.push([]);this.clear()},clear(){for(let y=0;y<24;y++)for(let x=0;x<80;x++)this.screen[y][x]=" "},write(x,y,text){Array.isArray(text)||(text=[text]);for(let j=0;j<text.length;j++)for(let i=0;i<text[j].length;i++)this.screen[y+j][x+i]=text[j][i]},draw(ctx){let text=this.screen.map(row=>row.join("")).join("\n");Text.drawText(ctx,Text.splitParagraph(text,Viewport.width),0,0,Text.glow)}};class MainMenu{constructor(){}update(){switch(Input.lastKey().toUpperCase()){case"P":Input.consume(),Game.startSession();break;case"L":Input.consume(),Game.playSpeed=(Game.playSpeed+1)%PLAY_SPEEDS.length;break;case"I":case"E":Input.consume(),Game.showInstructions()}}draw(){let highScores=["1) 6000  Bob","2) 6000  Tom","3) 4000  Wayne","",""];Screen.clear(),Screen.write(0,0,["               LL                     dd       dd","               LL                     dd       dd                      tm","               LL         aaaa     ddddd    ddddd    eeee   rrrrrrr","               LL        aa  aa   dd  dd   dd  dd   ee  ee  rr    rr","               LL        aa  aa   dd  dd   dd  dd   eeeeee  rr","               LL        aa  aa   dd  dd   dd  dd   ee      rr","               LLLLLLLL   aaa aa   ddd dd   ddd dd   eeee   rr","","                                       Version:    ?","(c) 1982, 1983 Yahoo Software          Terminal:   ?",`10970 Ashton Ave.  Suite 312           Play speed: ${Game.playSpeed+1} / ${PLAY_SPEEDS.length}`,"Los Angeles, Ca  90024                 Move = ↑↓←→/WASD, Jump = Space,","                                       Stop = Other","","P = Play game                          High Scores","L = Change level of difficulty         "+highScores[0],"C = Configure Ladder                   "+highScores[1],"I = Instructions                       "+highScores[2],"E = Exit Ladder                        "+highScores[3],"                                       "+highScores[4],"","Enter one of the above:"])}}class InstructionsMenu{constructor(){}update(){""!==Input.lastKey().toUpperCase()&&(Input.consume(),Game.showMainMenu())}draw(){Screen.clear(),Screen.write(0,0,["You are a Lad trapped in a maze.  Your mission is is to explore the","dark corridors never before seen by human eyes and find hidden","treasures and riches.","","You control Lad by typing the direction buttons and jumping by","typing SPACE.  But beware of the falling rocks called Der rocks.","You must find and grasp the treasures (shown as $) BEFORE the","bonus time runs out.","","A new Lad will be awarded for every 10,000 points.","Extra points are awarded for touching the gold","statues (shown as &).  You will receive the bonus time points","that are left when you have finished the level.","","Type an ESCape to pause the Game","","Remember, there is more than one way to skin a cat. (Chum)","","Good luck Lad.","","","","Type RETURN to return to main menu:"])}}const State={STOPPED:1,UP:2,LEFT:3,DOWN:4,RIGHT:5,FALLING:6,START_JUMP:7,JUMP_LEFT:8,JUMP_RIGHT:9,JUMP_UP:10,DYING:11,DEAD:12},JUMP_FRAMES={[State.JUMP_RIGHT]:[{x:1,y:-1},{x:1,y:-1},{x:1,y:0},{x:1,y:0},{x:1,y:1},{x:1,y:1}],[State.JUMP_LEFT]:[{x:-1,y:-1},{x:-1,y:-1},{x:-1,y:0},{x:-1,y:0},{x:-1,y:1},{x:-1,y:1}],[State.JUMP_UP]:[{x:0,y:-1},{x:0,y:-1},{x:0,y:0},{x:0,y:1},{x:0,y:1},{x:0,y:0}]};class Entity{applyMovement(field){let repeat=!1;if(this.nextState)switch(this.state){case State.STOPPED:case State.LEFT:case State.RIGHT:[State.LEFT,State.RIGHT,State.STOPPED].includes(this.nextState)&&(this.state=this.nextState,this.nextState=void 0);break;case State.UP:case State.DOWN:[State.LEFT,State.RIGHT].includes(this.nextState)&&(this.state=this.nextState,this.nextState=void 0)}switch(this.nextState===State.START_JUMP?field.onSolid(this.x,this.y)?this.state===State.STOPPED||this.state===State.FALLING?(this.state=State.JUMP_UP,this.jumpStep=0,this.nextState=State.STOPPED):this.state===State.LEFT||this.state===State.JUMP_LEFT?(this.state=State.JUMP_LEFT,this.jumpStep=0,this.nextState=State.LEFT):this.state!==State.RIGHT&&this.state!==State.JUMP_RIGHT||(this.state=State.JUMP_RIGHT,this.jumpStep=0,this.nextState=State.RIGHT):this.state===State.JUMP_UP||this.state===State.FALLING?this.nextState=State.STOPPED:this.state===State.JUMP_RIGHT?this.nextState=State.RIGHT:this.state===State.JUMP_LEFT&&(this.nextState=State.LEFT):this.nextState===State.UP&&field.isLadder(this.x,this.y)?(this.state=State.UP,this.nextState=void 0):this.nextState===State.DOWN&&(field.isLadder(this.x,this.y)||field.isLadder(this.x,this.y+1))&&(this.state=State.DOWN,this.nextState=void 0),this.state){case State.LEFT:if(!field.onSolid(this.x,this.y)){this.nextState=State.LEFT,this.state=State.FALLING,repeat=!0;break}field.emptySpace(this.x-1,this.y)?this.x--:this.nextState=State.STOPPED;break;case State.RIGHT:if(!field.onSolid(this.x,this.y)){this.nextState=State.RIGHT,this.state=State.FALLING,repeat=!0;break}field.emptySpace(this.x+1,this.y)?this.x++:this.nextState=State.STOPPED;break;case State.UP:field.canClimbUp(this.x,this.y-1)?this.y--:this.state=State.STOPPED;break;case State.DOWN:field.canClimbDown(this.x,this.y+1)?this.y++:this.state=State.STOPPED;break;case State.JUMP_RIGHT:case State.JUMP_LEFT:case State.JUMP_UP:let step=JUMP_FRAMES[this.state][this.jumpStep];if(console.log(["jump",this.state,this.jumpStep,step]),this.x+step.x>=0&&this.x+step.x<79){let terrain=field.layout[this.y+step.y][this.x+step.x];if(["=","|","-"].includes(terrain))if(field.onSolid(this.x,this.y))this.state=this.nextState,this.nextState=void 0;else{switch(this.state){case State.JUMP_RIGHT:this.nextState=State.RIGHT;break;case State.JUMP_LEFT:this.nextState=State.LEFT;break;case State.JUMP_UP:this.nextState=State.UP}this.state=State.FALLING}else"H"===terrain?(this.x+=step.x,this.y+=step.y,this.state=State.STOPPED,this.nextState=void 0):(this.x+=step.x,this.y+=step.y,this.jumpStep++,this.jumpStep>=JUMP_FRAMES[this.state].length&&(this.state=this.nextState,this.nextState=void 0))}else field.onSolid(this.x,this.y)?(this.state=this.nextState,this.nextState=void 0):(this.state=State.FALLING,this.nextState=State.STOPPED);break;case State.FALLING:field.onSolid(this.x,this.y)?this.state=this.nextState||State.STOPPED:this.y++}if(repeat)return this.applyMovement(field)}}const DEATH_FRAMES=["p","p","b","d","d","q","p","p","b","d","d","q","-","-","_","_","_","_","_"];class Player extends Entity{constructor(x,y){super(),this.x=x,this.y=y,this.state=State.STOPPED,this.nextState=State.STOPPED,this.jumpStep=0,this.deathStep=0,console.log("player constructed",x,y)}update(field,moveFrame){if(this.state===State.DYING&&(this.deathStep++,this.deathStep>=DEATH_FRAMES.length&&(this.state=State.DEAD)),this.state===State.DYING||this.state===State.DEAD)return;if(!moveFrame)return;let action=Input.lastAction();return action===Input.Action.LEFT?(this.nextState=State.LEFT,Input.consume()):action===Input.Action.RIGHT?(this.nextState=State.RIGHT,Input.consume()):action===Input.Action.UP?(this.nextState=State.UP,Input.consume()):action===Input.Action.DOWN?(this.nextState=State.DOWN,Input.consume()):action===Input.Action.JUMP&&(this.nextState=State.START_JUMP,Input.consume()),this.applyMovement(field)}draw(){let char="g";switch(this.state){case State.RIGHT:case State.JUMP_RIGHT:case State.UP:case State.DOWN:char="p";break;case State.LEFT:case State.JUMP_LEFT:char="q";break;case State.FALLING:char="b";break;case State.DYING:char=DEATH_FRAMES[this.deathStep];break;case State.DEAD:char="_"}Screen.write(this.x,this.y,char)}kill(){this.state!=State.DYING&&this.state!=State.DEAD&&(this.state=State.DYING)}}const DEATH_FRAMES$1=["{","}","(",")","%","%",":",":"];class Rock extends Entity{constructor(dispenser){super(),this.x=dispenser.x,this.y=dispenser.y,this.state=State.FALLING,this.nextState=void 0,this.deathStep=0}update(field,moveFrame){if(this.state===State.DYING&&(this.deathStep++,this.deathStep>=DEATH_FRAMES$1.length&&(this.state=State.DEAD)),this.state!==State.DYING&&this.state!==State.DEAD&&moveFrame){if(this.state===State.STOPPED&&(0!==this.x&&field.emptySpace(this.x-1,this.y)?78!==this.x&&field.emptySpace(this.x+1,this.y)?this.nextState=Math.random()>.5?State.LEFT:State.RIGHT:this.nextState=State.LEFT:this.nextState=State.RIGHT),0===this.x&&this.state===State.LEFT&&(this.state=State.RIGHT),78===this.x&&this.state===State.RIGHT&&(this.state=State.LEFT),this.state===State.FALLING||field.onSolid(this.x,this.y)||(this.nextState=State.FALLING),field.isLadder(this.x,this.y+1)&&[State.LEFT,State.RIGHT].includes(this.state)){let r=Math.floor(4*Math.random());this.nextState=[State.LEFT,State.RIGHT,State.DOWN,State.DOWN][r]}field.isEater(this.x,this.y)?this.state=State.DYING:this.applyMovement(field)}}draw(){let char="o";switch(this.state){case State.DYING:char=DEATH_FRAMES$1[this.deathStep];break;case State.DEAD:return}Screen.write(this.x,this.y,char)}}var LevelData=[{name:"Easy Street",time:35,maxRocks:5,layout:["                                       V                 $                     ","                                                         H                     ","                H                                        H                     ","       =========H==================================================            ","                H                                                              ","                H                                                              ","                H          H                             H                     ","================H==========H==================   ========H=====================","                &          H                             H          |       |  ","                                                         H         Easy Street ","                H                                        H                     ","       =========H==========H=========  =======================                 ","                H                                                              ","                H                                                              ","                H                                        H                     ","======================== ====================== =========H==============       ","                                                         H                     ","                                                         H                     ","*    p                                                   H                    *","==============================================================================="]},{name:"Long Island",time:45,maxRocks:8,layout:["                                                                          $    ","                                                                   &      H    ","    H       |V                                                     V|     H    ","====H======================= ========================= ======================  ","    H                                                                          ","    H                                                                          ","    H                    & |                         . .                  H    ","========================== ======  =================== ===================H==  ","                                                                          H    ","                                  |                                       H    ","    H                             |                 .  .                  H    ","====H=====================   ======  ================  ======================  ","    H                                                                          ","    H                      |                                                   ","    H                      |                        .   .                 H    ","=========================  ========    ==============   ==================H==  ","                                                                          H    ","==============                      |                                     H    "," Long Island |   p         *        |                 *                   H    ","==============================================================================="]},{name:"Ghost Town",time:35,maxRocks:5,layout:["                            V               V           V               $      ","                                                                       $$$     ","     p    H                                                    H      $$$$$   H","==========H===                                                =H==============H","          H                                                    H              H","          H                              &                     H              H","     ==============   ====     =    ======    =   ====    =====H=====         H","    G              ^^^    ^^^^^ ^^^^      ^^^^ ^^^    ^^^                     $","    h                                                                 |        ","    o     |                     H                             &       |        ","    s     ======================H============================== ===========    ","    t        &                  H                                              ","                                H                                              ","              |                 H                 H                   H        ","    T         ==================H=================H===================H======= ","    o                                             H                   H        ","    w                                                                 H        ","    n                           ^                                     H        ","*                              ^^^                                    H       *","==============================================================================="]},{name:"Tunnel Vision",time:36,rocks:5,layout:["                                            V                       V          ","                                                                               ","     H             H                         |                H                ","=====H=====--======H==========================     ===----====H===========     ","     H             H                |&&                       H                ","     H             H                ==================        H                ","     H             H                       tunnel  H          H                ","     H           =======---===----=================H=         H           H    ","     H         |                           vision  H          H           H    ","     H         =========---&      -----============H          H           H    ","     H           H                                 H |        H           H    ","     H           H=========----===----================        H  ==============","                 H                                        &   H                ","                 H                                        |   H                ","====---====      H                                        |   H                ","|         |    ================---===---===================   H                ","|   ===   |                                                   H        H    p  ","|    $    |                                                   H     ===H=======","|*  $$$  *|   *                *       *                     *H       *H       ","==============================================================================="]},{name:"Point of No Return",time:35,maxRocks:7,layout:["         $                                                                     ","         H                                                   V                 ","         H                                                                     ","         HHHHHHHHHHHHH     .HHHHHHHHHHHHHH                          H    p     ","         &                   V           H                        ==H==========","                                         H                          H          ","   H                                     H        .                 H          ","===H==============-----------============H====                      H          ","   H                                                      H         H          ","   H                                                 =====H==============      ","   H                                     H                H                    ","   H              &..^^^.....^..^ . ^^   H==---------     H                    ","   H         ============================H    &           H             H      ","   H         ===      ===      ===       H    ---------=================H======","   H                                     H                              H      ","   H                          &          H          &                   H      ","   ==========-------------------------=======----------===================     ","                                                                               ","^^^*         ^^^^^^^^^^^^^^^^^^^^^^^^^*     *^^^^^^^^^^*Point of No Return*^^^^","==============================================================================="]},{name:"Bug City",time:37,maxRocks:6,layout:["        Bug City             HHHHHHHH                          V               ","                           HHH      HHH                                        ","   H                                          >mmmmmmmm                        ","   H===============                   ====================          H          ","   H              |=====       \\  /         V                  =====H==========","   H                            \\/                                  H          ","   H                                        | $                     H          ","   H           H                            | H                     H          ","   H       ====H=======          p          |&H    H                H          ","   H           H             ======================H           ======          ","   H           H      &|                           H                    H      ","   H           H      &|                    H      H     }{        =====H====  ","===H===&       H       =====================H      H                    H      ","               H                            H      H                    H      ","               H                            H      &                    H      ","         ======H===   =======    H    <>    &                           H      ","                                 H==========       =====     =     ============","     }i{                         H                                             ","*                                H                                            *","==============================================================================="]},{name:"GangLand",time:32,maxRocks:6,layout:["                    =Gang Land=                             V                  ","                   ==      _  ==                                      .        ","      p    H        |  [] |_| |                  &                    .  H     ","===========H        |     |_| |       H         ===   ===================H     ","      V    H        =============     H======                            H     ","           H                          H                     &            H     ","           H                          H                |    |            H     ","    H      H        ^^^&&^^^ & ^  ^^^ H           H    |    =============H     ","    H======H   =======================H===========H=====          &      H     ","    H                                 H           H    |         &&&     H     ","    H                                 H           H    |        &&&&&    H     ","    H                                 H           H    |    =============H     ","              =====------=================        H    |       $     $         ","                                         |        H    |      $$$   $$$        ","====------===                            |        H    |     $$$$$ $$$$$       ","            |       =                    | =============    ============       ","            |       $                     ^          &                         ","            |^^^^^^^^^^^^^^      $ ^              ======                       ","*                   .      &   ^ H*^                    ^  ^       ^^^^^^^^^^^^","==============================================================================="]}];const Level={LEVELS:LevelData,LEVEL_COUNT:LevelData.length,load(levelNumber){console.log(Level.LEVELS);let level=Level.LEVELS[levelNumber%Level.LEVELS.length];if(!level)throw new Error("No such level number: "+levelNumber);let player,layout=level.layout.map(row=>row.split("")),dispensers=[];layout=layout.slice(0,20);for(let y=0;y<20;y++){layout[y]||(layout[y]=[]),layout[y]=layout[y].slice(0,79);for(let x=0;x<79;x++)layout[y][x]||(layout[y][x]=" "),"V"===layout[y][x]&&dispensers.push({x:x,y:y}),"p"===layout[y][x]&&(layout[y][x]=" ",player={x:x,y:y})}return{name:level.name,time:level.time,maxRocks:level.maRrocks,layout:layout,dispensers:dispensers,player:player}}};class PlayingField{constructor(levelNumber){let level=Level.load(levelNumber);this.layout=level.layout,this.dispensers=level.dispensers,this.time=2e3,this.player=new Player(level.player.x,level.player.y),this.rocks=[],this.winning=!1}update(moveFrame){if(this.winning)return Game.session.updateScore(3),this.time-=10,void(this.time<0&&Game.session.startNextLevel());this.time>0&&moveFrame&&this.time--;let oldX=this.player.x,oldY=this.player.y;this.player.update(this,moveFrame),oldX!==this.player.x&&oldY===this.player.y&&this.isDisappearingFloor(oldX,oldY+1)&&(this.layout[oldY+1][oldX]=" "),moveFrame&&this.checkIfPlayerShouldDie(Game.session);for(let rock of this.rocks)rock.update(this,moveFrame);if(moveFrame&&this.checkIfPlayerShouldDie(Game.session),moveFrame){if(this.isStatue(this.player.x,this.player.y)&&(this.layout[this.player.y][this.player.x]=" ",Game.session.updateScore(2)),this.isTreasure(this.player.x,this.player.y))return void(this.winning=!0);if(this.isTrampoline(this.player.x,this.player.y))switch(Math.floor(5*Math.random())){case 0:this.player.state=State.LEFT,this.player.nextState=void 0;break;case 1:this.player.state=State.RIGHT,this.player.nextState=void 0;break;case 2:this.player.state=State.JUMP_UP,this.player.nextState=void 0,this.player.jumpStep=0;break;case 3:this.player.state=State.JUMP_LEFT,this.player.nextState=State.LEFT,this.player.jumpStep=0;break;case 4:this.player.state=State.JUMP_RIGHT,this.player.nextState=State.RIGHT,this.player.jumpStep=0}if(this.rocks=this.rocks.filter(rock=>rock.state!==State.DEAD),this.rocks.length<this.maxRocks()&&Math.random()>.91){let dispenser=this.dispensers[Math.floor(Math.random()*this.dispensers.length)];this.rocks.push(new Rock(dispenser))}this.player.state===State.DEAD&&(Game.session.lives--,Game.session.lives<=0?Game.showMainMenu():Game.session.restartLevel())}}draw(){Screen.write(0,0,this.layout.map(row=>row.join(""))),this.player.draw(),this.rocks.forEach(rock=>rock.draw())}onSolid(x,y){return["=","-","H","|"].includes(this.layout[y+1][x])||"H"===this.layout[y][x]}emptySpace(x,y){return!(x<0||x>=79)&&!["|","="].includes(this.layout[y][x])}isLadder(x,y){return"H"===this.layout[y][x]}isStatue(x,y){return"&"===this.layout[y][x]}isTreasure(x,y){return"$"===this.layout[y][x]}isTrampoline(x,y){return"."===this.layout[y][x]}isEater(x,y){return"*"===this.layout[y][x]}isFire(x,y){return"^"===this.layout[y][x]}isDisappearingFloor(x,y){return"-"===this.layout[y][x]}canClimbUp(x,y){return!(y<0)&&["H","&","$"].includes(this.layout[y][x])}canClimbDown(x,y){return["H","&","$"," ","^","."].includes(this.layout[y][x])}checkIfPlayerShouldDie(){if(this.player.state!==State.DYING&&this.player.state!==State.DEAD){this.isFire(this.player.x,this.player.y)&&(this.player.state=State.DYING),this.time<=0&&(this.player.state=State.DYING);for(let i=0;i<this.rocks.length;i++)if(this.player.x===this.rocks[i].x){if(this.player.y===this.rocks[i].y){this.player.kill(),this.rocks.splice(i,1);break}(this.player.y===this.rocks[i].y-1&&this.emptySpace(this.player.x,this.player.y+1)||this.player.y===this.rocks[i].y-2&&this.emptySpace(this.player.x,this.player.y+1)&&this.emptySpace(this.player.x,this.player.y+2))&&Game.session.updateScore(1)}}}maxRocks(){return 7+1*this.dispensers.length+2*Game.session.hiddenFactor()}}class GameSession{constructor(){this.score=0,this.levelNumber=0,this.levelCycle=1,this.lives=5,this.nextLife=1e4,this.paused=!1}update(){let now=(new Date).getTime(),moveFrame=!1;now-(this.lastFrame||0)>=(this.nextFrame||0)&&(moveFrame=!0,this.nextFrame=now+this.moveFrameMillisecondDelay()),this.paused&&[Input.Action.PAUSE,Input.Action.RESUME].includes(Input.lastAction())&&(this.paused=!1,Input.consume()),this.paused||Input.lastAction()!==Input.Action.PAUSE||(this.paused=!0,Input.consume()),this.paused||(this.field||(this.field=new PlayingField(this.levelNumber)),this.field.update(moveFrame),this.handleCheatCodes())}draw(){this.field&&this.field.draw();let stat=[String(this.lives).padStart(2," "),String(this.levelNumber+1).padStart(2," "),String(this.score).padStart(6," "),this.field?String(this.field.time).padStart(4," "):""];Screen.write(0,21,`Lads   ${stat[0]}     Level   ${stat[1]}      Score   ${stat[2]}      Bonus time   ${stat[3]}`),this.paused&&Screen.write(0,23,"Paused - type ESCape or RETURN to continue.")}restartLevel(){this.field=void 0}startNextLevel(){this.field=void 0,this.levelNumber++,this.levelNumber%Level.LEVEL_COUNT==0&&this.levelCycle++}updateScore(scoreType){switch(scoreType){case 1:this.score+=200;break;case 2:this.score+=this.field.time;break;case 3:this.score+=10}this.score>=this.nextLife&&(this.lives++,this.nextLife+=1e4)}hiddenFactor(){return Math.floor(this.levelNumber/Level.LEVEL_COUNT)}moveFrameMillisecondDelay(){return Math.floor(PLAY_SPEEDS[Game.playSpeed]-.05*this.hiddenFactor()*PLAY_SPEEDS[Game.playSpeed])}handleCheatCodes(){let recentKeystrokes=Input.history.map(event=>event.key).join("").toUpperCase();recentKeystrokes.match(/IDCLEV(\d\d)/)?(Input.consume(!0),this.levelNumber=parseInt(RegExp.$1,10),this.field=void 0):recentKeystrokes.includes("IDDQD")?(Input.consume(!0),console.log("god mode")):recentKeystrokes.includes("IDKFA")?(Input.consume(!0),this.field&&(this.field.winning=!0)):recentKeystrokes.includes("IDKILL")&&(Input.consume(!0),this.field&&this.field.player&&this.field.player.kill())}}const Game={init(){Sprite.loadSpritesheet(async()=>{await Viewport.init(),await Screen.init(),await Sprite.init(),await Text.init(),await Input.init(),await Audio.init(),window.addEventListener("blur",()=>this.lostFocus()),window.addEventListener("focus",()=>this.gainedFocus()),this.start()})},start(){this.frame=0,this.playSpeed=0,this.menu=new MainMenu,window.requestAnimationFrame(()=>this.onFrame())},onFrame(){let now=(new Date).getTime();now-(this.lastFrame||0)>=1e3/60&&(this.frame++,this.update(),this.lastFrame=now),Viewport.resize(),this.draw(),window.requestAnimationFrame(()=>this.onFrame())},update(){Input.update(),Audio.update(),this.menu&&this.menu.update(),this.session&&this.session.update()},draw(){Viewport.ctx.setTransform(Viewport.scale,0,0,Viewport.scale,0,0),Viewport.ctx.fillStyle="#181818",Viewport.ctx.fillRect(0,0,Viewport.width,Viewport.height),Viewport.ctx.translate((Viewport.width-2592)/2|0,(Viewport.height-1600)/2|0),Screen.clear(),this.session&&this.session.draw(),this.menu&&this.menu.draw(),Screen.draw(Viewport.ctx),Viewport.ctx.fillStyle="rgba(0, 0, 0, 0.5)";for(let y=Math.floor(-Viewport.height/2)-4;y<Viewport.height+4;y+=4){let r=this.frame/5%4+y;Viewport.ctx.fillRect(-Viewport.width,r,2*Viewport.width,2)}},startSession(){this.menu=void 0,this.session=new GameSession,document.getElementsByClassName("github-corner")[0].className="github-corner hidden"},showMainMenu(){this.menu=new MainMenu,this.session=void 0,document.getElementsByClassName("github-corner")[0].className="github-corner"},showInstructions(){this.menu=new InstructionsMenu,this.session=void 0},lostFocus(){this.session&&(this.session.paused=!0)},gainedFocus(){}};Game.init()}();
//# sourceMappingURL=app.js.map
