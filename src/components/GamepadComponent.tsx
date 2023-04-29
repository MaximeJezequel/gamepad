import React, { useEffect, useState } from "react"

class MyGamepad {
  private readonly buffer: ArrayBuffer
  private readonly mappings: string

  constructor(buffer: ArrayBuffer, options: { mappings: string }) {
    this.buffer = buffer
    this.mappings = options.mappings
  }
}

const GamepadComponent: React.FC = () => {
  const [gamepad, setGamepad] = useState<Gamepad | null>(null)
  const [buttonPressed, setButtonPressed] = useState<number | null>(null)

  const handleGamepadConnected = (event: GamepadEvent) => {
    console.log("Gamepad connected:", event.gamepad)
    setGamepad(event.gamepad)
  }

  const handleGamepadDisconnected = (event: GamepadEvent) => {
    console.log("Gamepad disconnected:", event.gamepad)
    setGamepad(null)
  }

  const handleGamepadButtonPress = (event: GamepadEvent) => {
    console.log("Gamepad button pressed")
    const buttonIndex = event.gamepad.buttons.findIndex(
      (button) => button.pressed
    )
    console.log("Button pressed:", buttonIndex)
    setButtonPressed(buttonIndex)
  }

  async function connectGamepad() {
    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API is not supported in this browser.")
      return
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service"],
        filters: [{ services: ["battery_service"] }],
      })

      // Connect to the device
      const gatt = await device.gatt?.connect()

      // Get the Gamepad service
      const service = await gatt?.getPrimaryService("abxy_gamepad")

      // Get the Gamepad characteristic
      const characteristic = await service?.getCharacteristic(
        "abxy_gamepad_state"
      )

      // Create a new Gamepad object from the characteristic value
      const value = await characteristic?.readValue()

      if (!value) {
        console.error("Failed to read value from characteristic")
        return
      }

      // Create a new Gamepad object from the characteristic value

      setGamepad(
        new MyGamepad(value.buffer, {
          mappings: "standard",
        }) as unknown as Gamepad
      )
    } catch (error) {
      console.error("Bluetooth connection failed", error)
    }
  }

  useEffect(() => {
    window.addEventListener("gamepadconnected", handleGamepadConnected)
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected)
    requestAnimationFrame(updateGamepad)
  }, [])

  const updateGamepad = () => {
    if (gamepad) {
      const updatedGamepad = navigator.getGamepads()[gamepad.index]
      if (updatedGamepad) {
        updatedGamepad.buttons.forEach((button, index) => {
          if (button.pressed !== gamepad.buttons[index].pressed) {
            handleGamepadButtonPress({
              gamepad: updatedGamepad,
              bubbles: false,
              cancelBubble: false,
              cancelable: false,
              composed: false,
              currentTarget: null,
              defaultPrevented: false,
              eventPhase: 0,
              isTrusted: false,
              returnValue: false,
              srcElement: null,
              target: null,
              timeStamp: 0,
              type: "",
              composedPath: function (): EventTarget[] {
                throw new Error("Function not implemented.")
              },
              initEvent: function (
                type: string,
                bubbles?: boolean | undefined,
                cancelable?: boolean | undefined
              ): void {
                throw new Error("Function not implemented.")
              },
              preventDefault: function (): void {
                throw new Error("Function not implemented.")
              },
              stopImmediatePropagation: function (): void {
                throw new Error("Function not implemented.")
              },
              stopPropagation: function (): void {
                throw new Error("Function not implemented.")
              },
              NONE: 0,
              CAPTURING_PHASE: 1,
              AT_TARGET: 2,
              BUBBLING_PHASE: 3,
            })
          }
        })
        setGamepad(updatedGamepad)
      }
    }
    requestAnimationFrame(updateGamepad)
  }

  return (
    <div>
      {gamepad ? (
        <p>Gamepad connected: {gamepad.id}</p>
      ) : (
        <button onClick={() => connectGamepad()}>Connect to gamepad</button>
      )}
      <p>
        Button pressed:{" "}
        {buttonPressed !== null ? `Button ${buttonPressed} pressed` : "None"}
      </p>
    </div>
  )
}

export default GamepadComponent
