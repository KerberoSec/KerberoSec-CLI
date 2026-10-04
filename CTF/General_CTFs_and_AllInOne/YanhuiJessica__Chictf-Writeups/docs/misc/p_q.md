---
title: Misc: p😭q
description: 2021 | 中国科学技术大学第八届信息安全大赛 | General
---

## 题目

学会傅里叶的一瞬间，悔恨的泪水流了下来。

当我看到音频播放器中跳动的频谱动画，月明星稀的夜晚，深邃的银河，只有天使在浅吟低唱，复杂的情感于我眼中溢出，像是沉入了雾里朦胧的海一样的温柔。

这一刻我才知道，耳机音响也就图一乐，真听音乐还得靠眼睛。

（注意：flag 花括号内是一个 12 位整数，由 0-9 数位组成，没有其它字符。）

??? note "generate_sound_visualization.py"

    ```py
    #!/usr/bin/env python3

    from array2gif import write_gif  # version: 1.0.4
    import librosa  # version: 0.8.1
    import numpy  # version: 1.19.5

    num_freqs = 32
    quantize = 2
    min_db = -60
    max_db = 30
    fft_window_size = 2048
    frame_step_size = 512
    window_function_type = 'hann'
    red_pixel = [255, 0, 0]
    white_pixel = [255, 255, 255]
    y, sample_rate = librosa.load("flag.mp3")  # sample rate is 22050 Hz

    spectrogram = (numpy.around(librosa.power_to_db(librosa.feature.melspectrogram(y, sample_rate, n_mels=num_freqs,
                n_fft=fft_window_size, hop_length=frame_step_size, window=window_function_type)) / quantize) * quantize)

    gif_data = [numpy.kron(numpy.array([[red_pixel if freq % 2 and round(frame[freq // 2]) > threshold else white_pixel for threshold in list(range(
        min_db, max_db + 1, quantize))[::-1]] for freq in range(num_freqs * 2 + 1)]), numpy.ones([quantize, quantize, 1])) for frame in spectrogram.transpose()]

    write_gif(gif_data, 'flag.gif', fps=sample_rate/frame_step_size)
    ```

## 解题思路

- 首先需要获取 GIF 中的数据。看到 `write_gif()` 函数猜想应该有逆函数，于是找到了 [bunkahle/gif2numpy](https://github.com/bunkahle/gif2numpy)。可惜使用其他音频生成的 GIF 进行测试的时候，发现读取的数据有损失，最后还是使用了 PIL
    ```py
    from PIL import Image, ImageSequence

    img = Image.open('flag.gif')
    np_frames = numpy.array([numpy.array(frame.copy().convert('RGB').getdata(),dtype=numpy.uint8).reshape(frame.size[1],frame.size[0],3) for frame in ImageSequence.Iterator(img)])
    ```
- `power_to_db` 和 `melspectrogram` 分别有逆函数 `db_to_power` 和 `mel_to_audio`，只要获得 `spectrogram`（时频谱） 就可以了
    - 时频谱图（语谱图），横轴为时间，纵轴为频率，颜色表示幅值
- 分析 `gif_data` 的生成过程（直接使用其他音频对比 `spectrogram` 和 `gif_data` 更直观）

    ```py
    [
        numpy.kron(
            numpy.array(
                [
                    [
                        red_pixel
                        if freq % 2 and round(frame[freq // 2]) > threshold
                        else white_pixel
                        for threshold in list(range(min_db, max_db + 1, quantize))[::-1]
                    ] for freq in range(num_freqs * 2 + 1)
                ]
            ), numpy.ones([quantize, quantize, 1])
        ) for frame in spectrogram.transpose()  # 矩阵转置，时域 -> 频域
    ]
    ```

    - `gif_data` 为四维数组
        - 第一维为帧，代表时间
        - 第二维为图像横向数据，即不同频率
        - 第三维为图像纵向数据，即各频率的强度
        - 第四维是像素点 RGB 值

- 转换 GIF 数据

    ```py
    spectrogram = numpy.zeros([32, len(np_frames)], dtype=numpy.float32)

    for i in range(len(np_frames)):
        for h in range(len(np_frames[i])):
            for w in range(2, len(np_frames[i][h]), 2):
                if 0 in np_frames[i][h][w]:
                    spectrogram[(w + 2) // 4 - 1][i] = max(spectrogram[(w + 2) // 4 - 1][i], 92 - h)    # 高在数组中为倒序存储

    for i in range(len(spectrogram)):
        for j in range(len(spectrogram[i])):
            spectrogram[i][j] -= 60 # 转化到 [-60, 30]
    ```

- 生成音频文件，打开做个英语听力就可以了 XD

    ```py
    import soundfile

    S = librosa.feature.inverse.mel_to_audio(librosa.db_to_power(spectrogram), hop_length=frame_step_size, window=window_function_type)
    soundfile.write('flag.wav', S, sample_rate)
    ```

## 参考资料

- [tanyaschlusser/array2gif](https://github.com/tanyaschlusser/array2gif)