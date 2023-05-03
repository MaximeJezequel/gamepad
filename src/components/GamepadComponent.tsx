import React, { useCallback, useEffect, useState } from "react"

const GamepadComponent: React.FC = () => {
  const [gamepad, setGamepad] = useState<Gamepad | null>(null)
  const [buttonPressed, setButtonPressed] = useState<number | null>(null)

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

  const updateGamepad = () => {
    if (gamepad) {
      setGamepad((prevGamepad) => {
        const updatedGamepad =
          navigator.getGamepads()[prevGamepad?.index ?? gamepad?.index ?? 0]
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

  return (
    <div>
      {gamepad ? (
        <>
          <p>Gamepad connected: {gamepad.id}</p>
          <p>Gamepad index: {gamepad.index}</p>
        </>
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
