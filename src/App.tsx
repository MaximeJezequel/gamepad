import React, { useEffect, useState } from "react"
import { Gamepad } from "./components/Gamepad"

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
    const buttonIndex = event.gamepad.buttons.findIndex(
      (button) => button.pressed
    )
    console.log("Button pressed:", buttonIndex)
    setButtonPressed(buttonIndex)
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
      <Gamepad />
      <p>Gamepad connection status: {gamepad ? "Connected" : "Disconnected"}</p>
      <p>Button pressed: {buttonPressed !== null ? buttonPressed : "None"}</p>
    </div>
  )
}

export default GamepadComponent
