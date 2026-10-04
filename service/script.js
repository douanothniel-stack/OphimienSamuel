document.addEventListener("DOMContentLoaded",()=>{
  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.15});
  document.querySelectorAll(".reveal,.benefit").forEach((el,i)=>{if(el.classList.contains("benefit"))el.style.transitionDelay=`${i*80}ms`;reveal.observe(el)});
  const y=document.getElementById("year"); if(y)y.textContent=new Date().getFullYear();
  function initParticles(theme){
    if(!window.particlesJS)return;
    if(window.pJSDom&&window.pJSDom.length){try{window.pJSDom[0].pJS.fn.vendors.destroypJS()}catch(e){}window.pJSDom=[];}
    const light=theme==="light";
    particlesJS("particles-js",{particles:{number:{value:55,density:{enable:true,value_area:900}},color:{value:light?"#5fb4e6":"#00d9ff"},shape:light?{type:"polygon",polygon:{nb_sides:6}}:{type:"circle"},opacity:{value:light?.5:.35,random:true},size:{value:light?3.5:2.5,random:true},line_linked:{enable:true,distance:150,color:light?"#8cc8ee":"#00d9ff",opacity:light?.3:.15,width:1},move:{enable:true,speed:1.1,random:true,out_mode:"out"}},interactivity:{detect_on:"canvas",events:{onhover:{enable:true,mode:"grab"},resize:true},modes:{grab:{distance:140,line_linked:{opacity:.35}}}},retina_detect:true});
  }
  initParticles(document.documentElement.getAttribute("data-theme")||"dark");
  window.addEventListener("dove:theme",e=>initParticles(e.detail));
});
