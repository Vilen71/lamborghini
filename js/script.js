//* ================= СВАЙПЕР ===================

new Swiper(".swiper", {
   navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
   },
   loop: true,
   spaceBetween: 40,

   breakpoints: {
      750: {
         slidesPerView: 2,
         spaceBetween: 20,
      },
   }
})

const btns = document.querySelectorAll(".slide-swiper__button");

for (i of btns) {
   i.addEventListener("click", function () {
      const parent = this.closest(".slide-swiper");
      const dots = parent.querySelector(".dots");
      const cont = parent.querySelector(".cont");
      if (cont.style.maxHeight) {
         dots.classList.remove("active")
         cont.style.maxHeight = null;
         this.innerHTML = "читать подробнее..."
      }
      else {
         cont.style.maxHeight = cont.scrollHeight + 'px';
         dots.classList.add("active")
         this.innerHTML = "cкрыть"
      }
   })
}

//* ================= БУРГЕР ===================

const menu = document.querySelector(".top-header__menu")
const topHeader = document.querySelector(".top-header")
const burger = document.querySelector(".top-header__burger")

burger.addEventListener("click", menuClose);

function menuClose() {
   burger.classList.toggle("active");
   menu.classList.toggle("active");
   topHeader.classList.toggle("active");
   document.body.classList.toggle("lock");
}

//* ================= ШАПКА ===================

window.addEventListener("scroll", function () {
   if (scrollY >= 1) {
      topHeader.classList.add("bg");
   }
   else {
      topHeader.classList.remove("bg");
   }
})

//* ================= ПЛАВНЫЙ ПЕРЕХОД ===================

const menuItems = document.querySelectorAll(".top-header__link[data-goto]");

if (menuItems.length > 0) {
   menuItems.forEach(function (item) {
      item.addEventListener("click", onMenuLinkClick);

   });

   function onMenuLinkClick(e) {
      const menuLink = e.target;
      if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
         const gotoBlock = document.querySelector(menuLink.dataset.goto);
         const gotoBlockValue = gotoBlock.getBoundingClientRect().top + pageYOffset - topHeader.offsetHeight;
         
         if (burger.classList.contains("active")) {
            menuClose();
         }

         window.scrollTo({
            top: gotoBlockValue,
            behavior: "smooth"
         });
         e.preventDefault();
      }
   }
}

//================================================
function useDynamicAdapt(type = 'max') {
   const className = '_dynamic_adapt_'
   const attrName = 'data-da'

   /** @type {dNode[]} */
   const dNodes = getDNodes()

   /** @type {dMediaQuery[]} */
   const dMediaQueries = getDMediaQueries(dNodes)

   dMediaQueries.forEach((dMediaQuery) => {
      const matchMedia = window.matchMedia(dMediaQuery.query)
      // массив объектов с подходящим брейкпоинтом
      const filteredDNodes = dNodes.filter(({ breakpoint }) => breakpoint === dMediaQuery.breakpoint)
      const mediaHandler = getMediaHandler(matchMedia, filteredDNodes)
      matchMedia.addEventListener('change', mediaHandler)

      mediaHandler()
   })

   function getDNodes() {
      const result = []
      const elements = [...document.querySelectorAll(`[${attrName}]`)]

      elements.forEach((element) => {
         const attr = element.getAttribute(attrName)
         const [toSelector, breakpoint, order] = attr.split(',').map((val) => val.trim())

         const to = document.querySelector(toSelector)

         if (to) {
            result.push({
               parent: element.parentElement,
               element,
               to,
               breakpoint: breakpoint ?? '767',
               order: order !== undefined ? (isNumber(order) ? Number(order) : order) : 'last',
               index: -1,
            })
         }
      })

      return sortDNodes(result)
   }

   /**
    * @param {dNode} items
    * @returns {dMediaQuery[]}
    */
   function getDMediaQueries(items) {
      const uniqItems = [...new Set(items.map(({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`))]

      return uniqItems.map((item) => {
         const [query, breakpoint] = item.split(',')

         return { query, breakpoint }
      })
   }

   /**
    * @param {MediaQueryList} matchMedia
    * @param {dNodes} items
    */
   function getMediaHandler(matchMedia, items) {
      return function mediaHandler() {
         if (matchMedia.matches) {
            items.forEach((item) => {
               moveTo(item)
            })

            items.reverse()
         } else {
            items.forEach((item) => {
               if (item.element.classList.contains(className)) {
                  moveBack(item)
               }
            })

            items.reverse()
         }
      }
   }

   /**
    * @param {dNode} dNode
    */
   function moveTo(dNode) {
      const { to, element, order } = dNode
      dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement)
      element.classList.add(className)

      if (order === 'last' || order >= to.children.length) {
         to.append(element)

         return
      }

      if (order === 'first') {
         to.prepend(element)

         return
      }

      to.children[order].before(element)
   }

   /**
    * @param {dNode} dNode
    */
   function moveBack(dNode) {
      const { parent, element, index } = dNode
      element.classList.remove(className)

      if (index >= 0 && parent.children[index]) {
         parent.children[index].before(element)
      } else {
         parent.append(element)
      }
   }

   /**
    * @param {HTMLElement} element
    * @param {HTMLElement} parent
    */
   function getIndexInParent(element, parent) {
      return [...parent.children].indexOf(element)
   }

   /**
    * Функция сортировки массива по breakpoint и order
    * по возрастанию для type = min
    * по убыванию для type = max
    *
    * @param {dNode[]} items
    */
   function sortDNodes(items) {
      const isMin = type === 'min' ? 1 : 0

      return [...items].sort((a, b) => {
         if (a.breakpoint === b.breakpoint) {
            if (a.order === b.order) {
               return 0
            }

            if (a.order === 'first' || b.order === 'last') {
               return -1 * isMin
            }

            if (a.order === 'last' || b.order === 'first') {
               return 1 * isMin
            }

            return 0
         }

         return (a.breakpoint - b.breakpoint) * isMin
      })
   }

   function isNumber(value) {
      return !isNaN(value)
   }
}
useDynamicAdapt()
