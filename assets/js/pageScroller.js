Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

class PageScroller {
	constructor (PageScrollerId, minScreenHeight) {
		this.pageScrollerContainer = document.getElementById(PageScrollerId);
		this.pages = [...this.pageScrollerContainer.childNodes].filter((node) => node.nodeName === 'SECTION');

		this.currentIndex = 0;
		this.maxIndex = this.pages.length;

		// touch variables
		this.touchStartY = undefined;
		this.touchMoveY = undefined;
		this.touchDeltaY = undefined;
		this.touchPreviousMoveY = undefined;
		this.dragTreshold = 0.2;

		// Custom easing functions
		this.defaultEasingFunction = 'easeOutQuad';
		this.customSetEasingFunctionsDown = [];
		this.customSetEasingFunctionsUp = [];
		this.setEasingFunctions();

		// functions to be executed when arrived on a page
		this.pageFunctions = [];
		this.setPageFunctions();

		// transition functions for when an action hast to be done while transitioning
		this.customTransitionFunctionsDown = [];
		this.customTransitionFunctionsUp = [];
		this.setTransitionFunctions();

		// functions to be executed before leaving a page
		this.customBeforeTransitionFunctionsDown = [];
		this.customBeforeTransitionFunctionsUp = [];
		this.setBeforeTransitionFunctions();

		this.scrolling = false;
		this.scrollDuration = 650;

		this.setPageStyling();

		window.onresize = () => {
			if (minScreenHeight < window.innerHeight) {
				this.setPageStyling();
			} else {
				document.body.style.margin = '0';
				document.body.style.overflow = 'visible';
				this.pages.forEach((page) => {
					page.style.height = `${minScreenHeight}px`;
					page.style.width = '100vw';
				});
			}
		};

		document.addEventListener('wheel', (ev) =>{
			if (minScreenHeight < window.innerHeight) {
				let easingFunction; 
				let whileTransitioningFunction;
				let beforeTransitioningFunction;
				if (this.scrolling === false) {
					if (this.checkScrollDirection(ev)) { // up
						easingFunction = this.customSetEasingFunctionsUp[this.currentIndex] || this.defaultEasingFunction;
						whileTransitioningFunction = this.customTransitionFunctionsUp[this.currentIndex];
						beforeTransitioningFunction = this.customBeforeTransitionFunctionsUp[this.currentIndex];
						if (this.currentIndex > 0 ) this.currentIndex -= 1;
					} else { // down
						easingFunction = this.customSetEasingFunctionsDown[this.currentIndex] || this.defaultEasingFunction;
						whileTransitioningFunction = this.customTransitionFunctionsDown[this.currentIndex];
						beforeTransitioningFunction = this.customBeforeTransitionFunctionsDown[this.currentIndex];
						if (this.currentIndex < this.maxIndex - 1) this.currentIndex += 1;
					}
					this.scrollToElement(this.pages[this.currentIndex], this.scrollDuration, easingFunction, whileTransitioningFunction, beforeTransitioningFunction);
				}
			}
		})

		document.addEventListener('touchstart', (ev) => {
			this.touchStartY = ev.touches[0].screenY;
			this.touchPreviousMoveY = this.touchStartY;
		});

		document.addEventListener('touchmove', (ev) =>{
			this.touchDeltaY = this.touchStartY - ev.touches[0].screenY; // + is scroll down, - scroll up
			if (minScreenHeight < window.innerHeight && Math.abs(this.touchDeltaY) > window.innerHeight * this.dragTreshold ) {
				let easingFunction; 
				let beforeTransitioningFunction;
				let whileTransitioningFunction;
				if (this.scrolling === false) {
					if (this.touchDeltaY / Math.abs(this.touchDeltaY) === -1) { // up
						easingFunction = this.customSetEasingFunctionsUp[this.currentIndex] || this.defaultEasingFunction;
						whileTransitioningFunction = this.customTransitionFunctionsUp[this.currentIndex];
						beforeTransitioningFunction = this.customBeforeTransitionFunctionsUp[this.currentIndex];
						if (this.currentIndex > 0 ) this.currentIndex -= 1;
					} else { // down
						easingFunction = this.customSetEasingFunctionsDown[this.currentIndex] || this.defaultEasingFunction;
						whileTransitioningFunction = this.customTransitionFunctionsDown[this.currentIndex];
						beforeTransitioningFunction = this.customBeforeTransitionFunctionsDown[this.currentIndex];
						if (this.currentIndex < this.maxIndex - 1) this.currentIndex += 1;
					}
					this.scrollToElement(this.pages[this.currentIndex], this.scrollDuration, easingFunction, whileTransitioningFunction, beforeTransitioningFunction);
				}
			} else if (Math.abs(this.touchDeltaY) < window.innerHeight * this.dragTreshold) {
				const subDelta = this.touchPreviousMoveY - ev.touches[0].screenY;
				this.jumpToY(window.pageYOffset + subDelta)
				this.touchPreviousMoveY = ev.touches[0].screenY;
			}
		})

		document.addEventListener('touchend', (ev) => {
			if (Math.abs(this.touchDeltaY) < window.innerHeight * this.dragTreshold) {
				const easingFunction = this.customSetEasingFunctionsDown[this.currentIndex] || this.defaultEasingFunction;
				this.scrollToElement(this.pages[this.currentIndex], this.scrollDuration, easingFunction);
			}
		})
	}

	jumpToY(yCoordinate) {
		window.scrollTo(0, yCoordinate);
	}

	async scrollToElement(element, duration, easingFunction, whileTransitioningFunction = undefined, beforeTransitioningFunction = undefined) { 
		this.scrolling = true;
		const elementY = element.offsetTop;
		const startingY = window.pageYOffset;
		const deltaY = elementY - startingY;
		let start;
		await new Promise((resolve) => {
			if (beforeTransitioningFunction) {
				beforeTransitioningFunction()
					.then(() => {
						resolve()
					})
			} else {
				resolve();
			}
		})
		await new Promise((resolve) => {
			if (whileTransitioningFunction) whileTransitioningFunction();
			window.requestAnimationFrame(function step(timestamp) {
				if (!start) start = timestamp;
				const elapsed = timestamp - start;
				const nextPoint = easingFunctions[easingFunction](elapsed, startingY, deltaY, duration);
				window.scrollTo(0, nextPoint);
				if (elapsed < duration) {
					window.requestAnimationFrame(step);
				} else {
					resolve();
				}
			})
		}).then(() => {
			this.scrolling = false;
			if (this.pageFunctions[this.currentIndex]) this.pageFunctions[this.currentIndex]();
		})
	  }

	setPageStyling() {
		document.body.style.margin = '0';
		document.body.style.overflow = 'hidden';
		this.pages.forEach((page) => {
			page.style.height = '100vh';
			page.style.width = '100vw';
			page.style.padding = '0';
			page.style.overflow = 'hidden';
			page.style.boxSizing = 'border-box';
		});
	}

	setEasingFunctions() {
		this.pages.forEach((page) => this.customSetEasingFunctionsUp.push(undefined) );
		this.pages.forEach((page) => this.customSetEasingFunctionsDown.push(undefined) );
	}

	setPageFunctions() {
		this.pages.forEach((page) => this.pageFunctions.push(undefined) );
	}

	setTransitionFunctions() {
		this.pages.forEach((page) => this.customTransitionFunctionsDown.push(undefined) );
		this.pages.forEach((page) => this.customTransitionFunctionsUp.push(undefined) );
	}

	setBeforeTransitionFunctions() {
		this.pages.forEach((page) => this.customBeforeTransitionFunctionsDown.push(undefined) );
		this.pages.forEach((page) => this.customBeforeTransitionFunctionsUp.push(undefined) );
	}

	checkScrollDirection(event) {
		if (event.wheelDelta) {
			return event.wheelDelta > 0;
		}
		return event.deltaY < 0;
	}

	scrollToPage(index, easingFunction = this.defaultEasingFunction) { 
		let whileTransitioningFunction;
		let beforeTransitioningFunction;
		if (this.scrolling === false) {
			if (this.currentIndex > index) { // up
				easingFunction = this.customSetEasingFunctionsUp[this.currentIndex] || this.defaultEasingFunction;
				whileTransitioningFunction = this.customTransitionFunctionsUp[this.currentIndex];
				beforeTransitioningFunction = this.customBeforeTransitionFunctionsUp[this.currentIndex];
				if (index > 0 && index < this.maxIndex ) this.currentIndex = index;
			} else { // down
				easingFunction = this.customSetEasingFunctionsDown[this.currentIndex] || this.defaultEasingFunction;
				whileTransitioningFunction = this.customTransitionFunctionsDown[this.currentIndex];
				beforeTransitioningFunction = this.customBeforeTransitionFunctionsDown[this.currentIndex];
				if (index > 0 && index < this.maxIndex ) this.currentIndex = index;
			}
			this.scrollToElement(this.pages[this.currentIndex], this.scrollDuration, easingFunction, whileTransitioningFunction, beforeTransitioningFunction);
		}
	}

	set(props) {
		if (props.easingForAll) {
			this.customSetEasingFunctionsDown = this.customSetEasingFunctionsDown.map((func) => props.easingForAll.func);
			this.customSetEasingFunctionsUp = this.customSetEasingFunctionsUp.map((func) => props.easingForAll.func);
		}
		if (props.easing) {
			props.easing.forEach((entry) => {
				const { from, to, func } = entry;
				if (to) {
					if (from < to) this.customSetEasingFunctionsDown.insert(parseInt(from), func);
					if (from > to) this.customSetEasingFunctionsUp.insert(parseInt(from), func);
				} else {
					this.customSetEasingFunctionsDown.insert(parseInt(from), func);
					this.customSetEasingFunctionsUp.insert(parseInt(from), func);
				}
			});
		}
		if (props.actionOn) {
			props.actionOn.forEach((entry) => {
				const { pageIndex, action } = entry;
				this.pageFunctions.insert(parseInt(pageIndex), action);
			});
		}

		if (props.reset === "true") {
			this.scrollToElement(this.pages[0], 0, 'linearTween')
		}

		if (props.dragTreshold) {
			this.dragTreshold = props.dragTreshold;
		}

		if (props.whileTransitioning) {
			props.whileTransitioning.forEach((entry) => {
				const { from, to, callback } = entry;
				if (to) {
					if (from < to) this.customTransitionFunctionsDown.insert(from, callback);
					if (from > to) this.customTransitionFunctionsUp.insert(from, callback);
				} else {
					this.customTransitionFunctionsDown.insert(from, callback);
					this.customTransitionFunctionsUp.insert(from, callback);
				}
			});
		}

		if (props.beforeTransitioning) {
			props.beforeTransitioning.forEach((entry) => {
				const { from, to, callback } = entry;
				if (to) {
					if (from < to) this.customBeforeTransitionFunctionsDown.insert(from, callback);
					if (from > to) this.customBeforeTransitionFunctionsUp.insert(from, callback);
				} else {
					this.customBeforeTransitionFunctionsDown.insert(from, callback);
					this.customBeforeTransitionFunctionsUp.insert(from, callback);
				}
			});
		}
	}
}

class easingFunctions {	
	static linearTween(t, b, c, d) {
		return c*t/d + b;
	};

	static easeOutQuad(t, b, c, d) {
		t /= d;
		return -c * t*(t-2) + b;
	};

	static easeInOutQuad(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t + b;
		t--;
		return -c/2 * (t*(t-2) - 1) + b;
	};

	static easeInCubic(t, b, c, d) {
		t /= d;
		return c*t*t*t + b;
	};

	static easeOutCubic(t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t + 1) + b;
	};

	static easeInOutCubic(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t + 2) + b;
	};

	static easeInQuart(t, b, c, d) {
		t /= d;
		return c*t*t*t*t + b;
	};

	static easeOutQuart(t, b, c, d) {
		t /= d;
		t--;
		return -c * (t*t*t*t - 1) + b;
	};

	static easeInOutQuart(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t + b;
		t -= 2;
		return -c/2 * (t*t*t*t - 2) + b;
	};

	static easeInQuint(t, b, c, d) {
		t /= d;
		return c*t*t*t*t*t + b;
	};

	static easeOutQuint(t, b, c, d) {
		t /= d;
		t--;
		return c*(t*t*t*t*t + 1) + b;
	};

	static easeInOutQuint(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t*t*t*t + b;
		t -= 2;
		return c/2*(t*t*t*t*t + 2) + b;
	};

	static easeInSine(t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	};
	
	static easeOutSine(t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	};

	static easeInOutSine(t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	};

	static easeInExpo(t, b, c, d) {
		return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
	};

	static easeOutExpo(t, b, c, d) {
		return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
	};
	
	static easeInOutExpo(t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
		t--;
		return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
	};

	static easeInCirc (t, b, c, d) {
		t /= d;
		return -c * (Math.sqrt(1 - t*t) - 1) + b;
	};

	static easeOutCirc(t, b, c, d) {
		t /= d;
		t--;
		return c * Math.sqrt(1 - t*t) + b;
	};

	static easeInOutCirc(t, b, c, d) {
		t /= d/2;
		if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		t -= 2;
		return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
	};
}
