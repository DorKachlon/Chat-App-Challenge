import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [message, setMessage] = useState([]);
    const [user, setUser] = useState("");
    const [inputValue, setInputValue] = useState("");

    async function cb() {
        const response = await fetch("/messages");
        const data = await response.json();
        setMessage(data);
    }
    useEffect(() => {
        setInterval(cb, 1000);
        setUser(`Guest# ${Math.floor(Math.random() * 2001)}`);
    }, []);
    function changeHandler(value) {
        setInputValue(value);
    }
    function changeHandlerForUser(value) {
        setUser(value);
    }
    async function postMessage(e) {
        console.log();
        e.preventDefault();
        await fetch("/messages", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ body: inputValue, user: user }),
        });
        setInputValue("");
    }
    return (
        <>
            <form onSubmit={postMessage}>
                <input
                    value={inputValue}
                    type="text"
                    id="messageInput"
                    required
                    onChange={(e) => {
                        changeHandler(e.target.value);
                    }}
                ></input>
                <button id="sendButton" type="submit">
                    Send
                </button>
            </form>
            <input
                value={user}
                type="text"
                id="changeUserInput"
                required
                onChange={(e) => {
                    changeHandlerForUser(e.target.value);
                }}
            ></input>
            {message.length !== 0 && (
                <div className="messagesContainer">
                    {message.map((element, i) => {
                        return (
                            <div
                                className={
                                    element.user === user
                                        ? "my-msg msg"
                                        : "other-msg msg"
                                }
                                key={i}
                            >
                                <div>{element.user}</div>
                                <div>{element.body}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

export default App;
