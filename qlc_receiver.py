#!/usr/bin/env python

import os
import asyncio
import websockets

# Channel 1 = red
# Channel 2 = green
# Channel 3 = blue
# Channel 4 = effects

channel_value = [0,0,0,0];

new_info      = False

async def listener_qlc(universe_index, start_channel, channels_count):
    global channel_value
    global new_info


    qlc_websocket = "ws://127.0.0.1:9999/qlcplusWS"
    cmd           = f"QLC+API|getChannelsValues|{universe_index}|{start_channel}|{channels_count}"

    try:
        async with websockets.connect(qlc_websocket,ping_interval=None) as websocket:

            while True:
                try:
                    await websocket.send(cmd)
                    response        = await websocket.recv()
                    response_fields = response.split("|")

                    for index, value in enumerate(channel_value):

                        if value != response_fields[(index + 1) * 3]:

                            new_info         = True
                            channel_value[0] = response_fields[3]
                            channel_value[1] = response_fields[6]
                            channel_value[2] = response_fields[9]
                            channel_value[3] = response_fields[12]

                            print("QLC value ", channel_value)
                            break
                    await asyncio.sleep(0.1)

                except Exception as err:
                    print("An exception occurred ", err)
                    continue
    except Exception as err:
         print(f"An exception occurred connecting to {qlc_websocket}", err)


async def send_dmx_values_to_websocket(websocket_url):
    global channel_value
    global new_info

    try:
        async with websockets.connect(websocket_url) as websocket:

            while True:
                try:
                    if new_info:

                        ch1 = channel_value[0]
                        ch2 = channel_value[1]
                        ch3 = channel_value[2]
                        ch4 = channel_value[3]

                        rgbX = f"{ch1},{ch2},{ch3},{ch4}"

                        print("Sending " + rgbX)

                        await websocket.send(rgbX)

                        new_info = False

                    await asyncio.sleep(0.1)

                except Exception as err:
                    print("An exception occurred ", err)
    except Exception as err:
        print(f"An exception occurred connecting to {websocket_url}", err)



if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    try:
        user = "qlcplus"
        loop.create_task(listener_qlc(universe_index = 1, start_channel = 71, channels_count = 4))
        loop.create_task(send_dmx_values_to_websocket(websocket_url = f"wss://interactiveviewer.glitch.me/?user={user}"))
        loop.run_forever()
    finally:
        loop.close()
        print(f"Successfully shutdown [{loop}].")

        #Revisar cuando termina