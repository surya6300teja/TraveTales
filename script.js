const menus=document.querySelector(".nav ul");
const header=document.querySelector("header");
const menuBtn=document.querySelector(".menu btn");
const closeBtn=document.querySelector(".close-btn");
const nav=document.querySelector(".header .nav")

menuBtn.addEventListener('click',()=>{
    menus.classList.add("display");
});

closeBtn.addEventListener("click",()=>{
    menus.classList.remove("display");
});
window.addEventListener('scroll',()=>{
    if(document.documentElement.scrollTop>20){
        header.classList.add("sticky");
    }
    else{
        header.classList.remove("sticky");
    }
});
window.onscroll=()=>{
    menus.classList.remove('fa-times');
    nav.classList.remove('active');
}


