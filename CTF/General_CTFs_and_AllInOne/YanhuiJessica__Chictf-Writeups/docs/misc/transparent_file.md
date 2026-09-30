---
title: Misc: 透明的文件
description: 2021 | 中国科学技术大学第八届信息安全大赛 | General
---

## 题目

一个透明的文件，用于在终端中展示一个五颜六色的 flag。

可能是在 cmd.exe 等劣质终端中被长期使用的原因，这个文件失去了一些重要成分，变成了一堆乱码，也不会再显示出 flag 了。

注意：flag 内部的字符全部为小写字母。

## 解题思路

- 查看 `transparent.txt`，有点眼熟啊 (ŏωŏ)
    ```bash
    # transparent.txt 节选

    [0;0H[20;58H[8;34H[13;27H[4;2H[38;2;1;204;177m
    ```

- 根据 `用于在终端中展示一个五颜六色的 flag`，再结合 [RsaCtfTool/test.sh](https://github.com/Ganapati/RsaCtfTool/blob/master/test.sh)（十分感谢！😽） 推测是终端设置颜色和格式化的控制序列，只不过语法结构有缺失
    - [ANSI escape code: Wikipedia](https://en.wikipedia.org/wiki/ANSI_escape_code)
- 在所有 `[` 之前添加 `\e` 或 `\033` 或 `\x1B`
- 清空终端并执行 `` echo -e `cat transparent.txt` ``，然后全部选中（由于打印的字符为空格，选中才可见设置的字体颜色）就可以看到 Flag 了 🥳<br>
*[Image: flag{abxnniohkalmcowsayfiglet}]*

    - 或者替换空格为可见字符 `` echo -e `cat transparent.txt | sed 's/ /O/g'` ``<br>
*[Image: 不用全选也能看]*

## 咕咕咕

- 终端显示依赖于控制序列
- ed（文本编辑器）: [ed(1): Linux man page](https://linux.die.net/man/1/ed)
    - 适用于不解析控制字符的 dumb terminal
      ```bash
      # 插入模式与结束
      a<Enter>{{text_to_insert}}<Enter>.

      # 保存
      w {{filename}}

      # 退出
      q
      ```

### `reset` vs `clear`

- `clear` 清空终端屏幕
- `reset` 将重新初始化终端，比 `clear` 更彻底，但保留 `bash` 的状态

## 参考资料

- [bash:tip_colors_and_formatting: FLOZz' MISC](https://misc.flogisoft.com/bash/tip_colors_and_formatting)
- [clear(1): Linux man page](https://linux.die.net/man/1/clear)
- [reset(1): Linux man page](https://linux.die.net/man/1/reset)