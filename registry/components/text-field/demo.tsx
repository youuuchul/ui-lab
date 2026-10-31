"use client";
import { useState } from "react";
import { TextField } from "./TextField";

const NICK = /^[가-힣a-zA-Z0-9]*$/;

export default function Demo() {
  const [nick, setNick] = useState("하");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const nickError = !NICK.test(nick) ? "기호와 공백은 쓸 수 없어요" : nick.length > 0 && nick.length < 2 ? "2~12자로 입력해 주세요" : undefined;
  const emailError = touched && email && !/^\S+@\S+\.\S+$/.test(email) ? "이메일 형식이 아니에요" : undefined;
  return (
    <div className="flex w-80 flex-col gap-4">
      <TextField label="닉네임" helperText="한글·영문·숫자 2~12자" error={nickError} value={nick} onChange={setNick} maxLength={12} showCount />
      <TextField
        label="이메일"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={setEmail}
        onBlur={() => setTouched(true)}
        error={emailError}
      />
      <TextField label="아이디" helperText="가입 후에는 바꿀 수 없어요" defaultValue="yuchul_k" disabled />
    </div>
  );
}
