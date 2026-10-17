import cv2,numpy as np,sys,json
from PIL import Image
def _sticker(src,rect,out,iters=6,white_bg=False,outline=9,size=520,extra_bg=None,thr=235):
    im=cv2.imread(src);h,w=im.shape[:2]
    if white_bg:
        g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY);m=(g<thr).astype(np.uint8)
        m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
    else:
        mask=np.zeros((h,w),np.uint8);x0,y0,x1,y1=[int(v) for v in (rect[0]*w,rect[1]*h,rect[2]*w,rect[3]*h)]
        bgd=np.zeros((1,65),np.float64);fgd=np.zeros((1,65),np.float64)
        cv2.grabCut(im,mask,(x0,y0,x1-x0,y1-y0),bgd,fgd,iters,cv2.GC_INIT_WITH_RECT)
        m=np.where((mask==1)|(mask==3),1,0).astype(np.uint8)
    # keep largest component
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    if n>1:
        k=1+np.argmax(st[1:,cv2.CC_STAT_AREA]);m=(lab==k).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8));m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    # fill holes
    ff=m.copy();cv2.floodFill(ff,None,(0,0),1);holes=(ff==0);m[holes]=1 if not white_bg else m[holes]
    pad=outline*3
    m=cv2.copyMakeBorder(m,pad,pad,pad,pad,cv2.BORDER_CONSTANT,0);im=cv2.copyMakeBorder(im,pad,pad,pad,pad,cv2.BORDER_REPLICATE)
    ol=cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(outline*2+1,outline*2+1)))
    ol=cv2.GaussianBlur(ol.astype(np.float32),(5,5),0)
    ys,xs=np.where(ol>0.05);y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max()
    gray=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
    ms=cv2.GaussianBlur(m.astype(np.float32),(3,3),0)
    rgb=np.zeros((*m.shape,4),np.float32)
    paper=np.array([207,225,233],np.float32) # BGR of #e9e1cf
    for c in range(3): rgb[...,c]=paper[c]*(1-ms)+gray*ms
    rgb[...,3]=np.clip(ol,0,1)*255
    rgb=rgb[y0:y1+1,x0:x1+1]
    img=Image.fromarray(cv2.cvtColor(rgb.astype(np.uint8),cv2.COLOR_BGRA2RGBA))
    s=size/max(img.size);img=img.resize((int(img.size[0]*s),int(img.size[1]*s)),Image.LANCZOS)
    img.save(out,'WEBP',quality=86);print(out,img.size)
def sticker(*a,**k):
    try:_sticker(*a,**k)
    except Exception as e:print('FAIL',a[2],e)
P='/home/claude/koleso/photos/'
sticker(P+'L1.jpg',(.08,.05,.92,.97),'S_flute.webp')
sticker(P+'E1.jpg',(.15,.08,.85,.85),'S_pot.webp')
sticker(P+'X8.jpg',None,'S_benz.webp',white_bg=True,thr=200)
sticker(P+'F1.jpg',(.02,.04,.98,.98),'S_wheel.webp',iters=8)


sticker(P+'R1.jpg',(.33,.06,.62,.66),'S_ferris.webp',iters=8)
sticker(P+'E2.jpg',None,'S_pot_drawing.webp',white_bg=True,thr=200)
sticker(P+'L3.jpg',None,'S_potter.webp',white_bg=True,thr=200)
sticker(P+'X12.jpg',(.15,.03,.85,.97),'S_clock.webp',iters=8)
sticker(P+'P1.jpg',(.05,.45,.98,.99),'S_oxcart.webp',iters=8)
sticker(P+'X11.jpg',(.1,.0,.9,1),'S_steer.webp',iters=8)

