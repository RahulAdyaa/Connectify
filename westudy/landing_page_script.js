const items = document.querySelectorAll('.accordion-item button');

        items.forEach(item => {
            item.addEventListener('click', function() {
                const parent = this.parentElement;
                const content = parent.querySelector('.accordion-item-content');

                items.forEach(btn => {
                    if (btn !== this) {
                        btn.parentElement.classList.remove('active');
                        btn.parentElement.querySelector('.accordion-item-content').style.display = 'none';
                    }
                });

                parent.classList.toggle('active');
                content.style.display = parent.classList.contains('active') ? 'block' : 'none';
            });
        });

        // Hamburger Menu Functionality
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const navbar = document.getElementById('navbar');

        function showSidebar(){
            const sidebar=document.querySelector('.sidebar')
            sidebar.style.display='flex'
        }
        function hideSidebar(){
            const sidebar=document.querySelector('.sidebar')
            sidebar.style.display='none'
        
        }

        //animation for moving image over elements
function page2animation(){
  
    var rightElems=document.querySelectorAll(".right-elem")
    
    
    rightElems.forEach(function(elem){
      elem.addEventListener("mouseenter",function(){
    
        console.log(elem.getBoundingClientRect())//give all info about that particular div
        gsap.to(elem.childNodes[3],{
          opacity:1,
          scale:1
        })
      })
      elem.addEventListener("mouseleave",function(){
        gsap.to(elem.childNodes[3],{
          opacity:0,
          scale:0
        })
      })
      elem.addEventListener("mousemove",function(dets){
        gsap.to(elem.childNodes[3],{
          x:dets.x-elem.getBoundingClientRect().x-60,
          y:dets.y-elem.getBoundingClientRect().y-130
        })
      })
    })
    }
    
page2animation()


var nav_get_started_btn=document.querySelector(".get_started-btn-nav")
nav_get_started_btn.addEventListener("click",function(){
  window.location.href="./signuppage.html"
})

var about_us_btn=document.querySelector(".about-us-btn")
about_us_btn.addEventListener("click",function(){
  window.location.href="landing_page.html"
})

