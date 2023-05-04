import React, { useCallback, useEffect, useState } from "react"

const GamepadComponent: React.FC = () => {
  const [gamepad, setGamepad] = useState<Gamepad | null>(null)
  const [buttonPressed, setButtonPressed] = useState<number | null>(null)
  const [count, setCount] = useState<number>(0)

  const handleResetClick = () => {
    setCount(0)
  }

  ////////////////////////////////
  ///CONNEXION
  ////////////////////////////////

  // Gamepad is connecting
  const handleGamepadConnected = (event: GamepadEvent) => {
    console.log("Gamepad connected:", event.gamepad)
    setGamepad(event.gamepad)
  }

  // Gamepad is disconnecting
  const handleGamepadDisconnected = (event: GamepadEvent) => {
    console.log("Gamepad disconnected:", event.gamepad)
    setGamepad(null)
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
      setGamepad(new Gamepad())
    } catch (error) {
      console.error("Bluetooth connection failed", error)
    }
  }

  const handleGamepadButtonPress = useCallback(
    (event: any, setButtonPressed: Function) => {
      console.log("Gamepad button pressed")
      const buttonIndex = event.gamepad.buttons.findIndex(
        (button: any) => button.pressed
      )
      console.log("Button pressed:", buttonIndex)
      setButtonPressed(buttonIndex)
    },
    []
  )

  const updateGamepad = () => {
    if (gamepad) {
      setGamepad((prevGamepad) => {
        const updatedGamepad =
          navigator.getGamepads()[
            prevGamepad?.index ?? gamepad?.index ?? 0 ?? 1
          ]
        if (updatedGamepad) {
          updatedGamepad.buttons.forEach((button, index) => {
            if (button.pressed !== prevGamepad?.buttons[index].pressed) {
              handleGamepadButtonPress(
                {
                  gamepad: updatedGamepad,
                },
                () => setButtonPressed(index)
              )
            }
          })
        }
        return updatedGamepad
      })
    }
    requestAnimationFrame(updateGamepad)
  }

  useEffect(() => {
    window.addEventListener("gamepadconnected", handleGamepadConnected)
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected)
    requestAnimationFrame(updateGamepad)

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected)
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected
      )
    }
  }, [])

  useEffect(() => {
    if (buttonPressed == 9) {
      setCount(0)
    } else if (buttonPressed !== null) {
      setCount(count + buttonPressed)
    }
  }, [buttonPressed])

  return (
    <div className="gamepad-container">
      <h3>Bluetooth Connexion</h3>
      {gamepad ? (
        <>
          <p>Gamepad connected: {gamepad.id}</p>
          <p>Gamepad index: {gamepad.index}</p>
        </>
      ) : (
        <button onClick={() => connectGamepad()}>Connect to gamepad</button>
      )}
      <h3>Inputs</h3>
      <p>
        Button pressed:{" "}
        {buttonPressed !== null ? `Button ${buttonPressed} pressed` : "None"}
      </p>
      <p>Count: {count}</p>
      <button onClick={() => handleResetClick()}>Reset</button>
    </div>
  )
}

export default GamepadComponent
