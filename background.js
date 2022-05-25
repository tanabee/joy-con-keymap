const BUTTON = {
  LEFT: 0,
  DOWN: 1,
  UP: 2,
  RIGHT: 3,
  SL: 4,
  SR: 5,
  ZL: 6,
  L: 8,
  MINUS: 9,
  CAPTURE_BUTTON: 16,
}

const STICK = {
  LEFT: 0,
  DOWN: 1,
  UP: 2,
  RIGHT: 3,
}

const config = {
  button: {
    [BUTTON.LEFT]: 'a',
    [BUTTON.DOWN]: 'b',
    [BUTTON.UP]: 'x',
    [BUTTON.RIGHT]: 'y',
    [BUTTON.SL]: 'l',
    [BUTTON.SR]: 'r',
  },
  stick: {
    [STICK.LEFT]: 'ArrowDown',
    [STICK.DOWN]: 'ArrowRight',
    [STICK.UP]: 'ArrowLeft',
    [STICK.RIGHT]: 'ArrowUp',
  },
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ config })
})
