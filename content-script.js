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

let gamepadIndex, intervalID
let config = {
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

window.onload = () => {
  chrome.storage.sync.get('config', data => {
    config = data.config
  })
}

const VENDOR_ID = '57e'
const DEVICE_ID = '2006'

function dispatchKeyboardEvent(key) {
  const events = ['keydown', 'keyup']
  events.forEach(e => {
    document.body.dispatchEvent(new KeyboardEvent(e, { key, bubbles: true }))
  })
}

addEventListener('gamepadconnected', async ({ gamepad }) => {
  if (!gamepad.id.includes(VENDOR_ID) || !gamepad.id.includes(DEVICE_ID)) {
    return
  }

  const pressKey = key => {
    const events = ['keydown', 'keyup']
    events.forEach(e => {
      document.body.dispatchEvent(new KeyboardEvent(e, { key, bubbles: true }))
    })
  }

  let gamepadIndex = gamepad.index

  intervalID = setInterval(() => {
    const joycon = navigator.getGamepads()[gamepadIndex]

    joycon.axes.forEach((v, i) => {
      // i: 0, v: 1 > StickDown
      // i: 1, v: 1 > StickLeft
      if (v > 0.5) {
        pressKey(config.stick[i === 0 ? STICK.DOWN : STICK.LEFT])
      }

      // i: 0, v: -1 > StickUp
      // i: 1, v: -1 > StickRight
      if (v < -0.5) {
        pressKey(config.stick[i === 0 ? STICK.UP : STICK.RIGHT])
      }
    })

    if (joycon.buttons.some(button => button.pressed)) {
      const buttons = joycon.buttons
        .map((button, index) => ({ button, index }))
        .filter(x => x.button.pressed)
      buttons.forEach(x => {
        if (config.button[x.index]) {
          pressKey(config.button[x.index])
        }
      })
    }
  }, 1000 / 60)
})

addEventListener('gamepaddisconnected', e => {
  if (gamepadIndex === e.gamepad.index) {
    clearInterval(intervalID)
    gamepadIndex = intervalID = null
  }
})
