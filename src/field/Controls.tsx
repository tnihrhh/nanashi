import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  moveDirectionRef: React.MutableRefObject<number>;
  jumpRequestedRef: React.MutableRefObject<boolean>;
  // フィールドでは「ジャンプ」、町では「インタラクト」など、画面によって意味が変わるボタンの見た目。
  actionIcon?: string;
};

// ボタンを押した/離したタイミングで ref の中身を書き換えるだけ。
// ref の書き換えは再描画を起こさないので、このコンポーネントは
// ゲームプレイ中に一切再描画されない(React.memo の効果)。
function ControlsComponent({ moveDirectionRef, jumpRequestedRef, actionIcon = '▲' }: Props) {
  return (
    <>
      <Pressable
        style={[styles.button, styles.left]}
        onPressIn={() => {
          moveDirectionRef.current = -1;
        }}
        onPressOut={() => {
          if (moveDirectionRef.current === -1) moveDirectionRef.current = 0;
        }}
      >
        <Text style={styles.buttonText}>◀</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.right]}
        onPressIn={() => {
          moveDirectionRef.current = 1;
        }}
        onPressOut={() => {
          if (moveDirectionRef.current === 1) moveDirectionRef.current = 0;
        }}
      >
        <Text style={styles.buttonText}>▶</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.jump]}
        onPressIn={() => {
          jumpRequestedRef.current = true;
        }}
      >
        <Text style={styles.buttonText}>{actionIcon}</Text>
      </Pressable>
    </>
  );
}

export const Controls = React.memo(ControlsComponent);

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 40,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: {
    left: 24,
  },
  right: {
    left: 100,
  },
  jump: {
    right: 24,
  },
  buttonText: {
    fontSize: 28,
    color: 'white',
  },
});
