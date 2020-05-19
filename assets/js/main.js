const pageScroller = new PageScroller('page-container', 400);

const pageOneLeave = (resolve) => {
	
	const tl = gsap.timeline({repeat: 0, repeatDelay: 0});
	tl.fromTo("#mockup-home", 0.5, {x: '0'}, {x: '500%', ease: Power3.easeInOut})
	tl.fromTo("#intro", 0.5, {x: '0'}, {x: '-500%', ease: Power3.easeInOut}, '-=0.5')
	tl.fromTo("#waves", 0.5, {y: '0'}, {y: '40vh', ease: Power3.easeInOut}, '-=0.5')
	tl.fromTo("#wave-bottom", 0.5, {y: '0'}, {y: '40vh', ease: Power3.easeInOut}, '-=0.5')

	tl.fromTo("#mockup-overview", 0.5, {x: '-500%'}, {x: '0', ease: Power3.easeInOut}, '-=0.3')
	tl.fromTo("#content-container__share", 0.5, {x: '500%'}, {x: '0', ease: Power3.easeInOut}, '-=0.3')
	tl.fromTo("#content-container__share", 0.5, {opacity: '0'}, {opacity: '1', ease: Power3.easeInOut}, '-=0.5')
	tl.fromTo("#content-container__improve", 0.5, {x: '500%'}, {x: '0', ease: Power3.easeInOut}, '-=0.1')
	tl.fromTo("#content-container__improve", 0.5, {opacity: '0'}, {opacity: '1', ease: Power3.easeInOut}, '-=0.5')
	
	document.getElementById('menu-home').classList.remove('menu-active');
	document.getElementById('menu-about').classList.add('menu-active');
	resolve();
}
const pageOneEnter = (resolve) => {
	
	const tl = gsap.timeline({repeat: 0, repeatDelay: 0});
	tl.fromTo("#mockup-home", 0.5, {x: '500%'}, {x: '0', ease: Power3.easeInOut})
	tl.fromTo("#intro", 0.5, {x: '-500%'}, {x: '0', ease: Power3.easeInOut}, '-=0.5')

	tl.fromTo("#mockup-overview", 0.5, {x: '0'}, {x: '-500%', ease: Power3.easeInOut}, '-=0.5')
	tl.fromTo("#content-container__share", 0.5, {x: '0'}, {x: '500%', ease: Power3.easeInOut}, '-=0.5')
	tl.fromTo("#content-container__share", 0.5, {opacity: '1'}, {opacity: '0', ease: Power3.easeInOut}, '-=0.5')
	tl.fromTo("#content-container__improve", 0.5, {x: '0'}, {x: '500%', ease: Power3.easeInOut}, '-=0.4')
	tl.fromTo("#content-container__improve", 0.5, {opacity: '1'}, {opacity: '0', ease: Power3.easeInOut}, '-=0.3')

	tl.to("#waves", 0.5, {y: '0', ease: Power3.easeInOut}, '-=0.1' )
	
	document.getElementById('menu-about').classList.remove('menu-active');
	document.getElementById('menu-home').classList.add('menu-active');
	
	resolve();
}

pageScroller.set({
	reset: "true",
	easingForAll: {
		func: "easeInOutQuart",
	},
	beforeTransitioning: [
		{
			from: '0',
			to: '1',
			callback: () => {
				return new Promise((resolve) => {
					pageOneLeave(resolve);
					
				});
			},
		},
		{
			from: '1',
			to: '0',
			callback: () => {
				return new Promise((resolve) => {
					pageOneEnter(resolve);
					
				});
			},
		},
		{
			from: '1',
			to: '2',
			callback: () => {
				return new Promise((resolve) => {
					document.getElementById('menu-about').classList.remove('menu-active');
					document.getElementById('menu-register').classList.add('menu-active');
					resolve();
				});
			},
		},
		{
			from: '2',
			to: '1',
			callback: () => {
				return new Promise((resolve) => {
					document.getElementById('menu-register').classList.remove('menu-active');
					document.getElementById('menu-about').classList.add('menu-active');
					resolve();
				});
			},
		},
	],
});

document.getElementById('menu-home').addEventListener('click', () => {
	document.getElementById('menu-about').classList.remove('menu-active');
	document.getElementById('menu-register').classList.remove('menu-active');
	document.getElementById('menu-home').classList.add('menu-active');
	pageScroller.scrollToPage(0);
})

document.getElementById('menu-about').addEventListener('click', () => {
	document.getElementById('menu-home').classList.remove('menu-active');
	document.getElementById('menu-register').classList.remove('menu-active');
	document.getElementById('menu-about').classList.add('menu-active');
	pageScroller.scrollToPage(1);
})

document.getElementById('menu-register').addEventListener('click', () => {
	document.getElementById('menu-home').classList.remove('menu-active');
	document.getElementById('menu-about').classList.remove('menu-active');
	document.getElementById('menu-register').classList.add('menu-active');
	pageScroller.scrollToPage(2);
})