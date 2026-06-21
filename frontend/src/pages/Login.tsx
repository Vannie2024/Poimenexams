import { useState } from "react";
import { loginUser } from "../services/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const data = await loginUser(username, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("role", data.role);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          role: data.role,
        }),
      );
      if (data.role === "ADMIN") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/student-dashboard";
      }
    } catch {
      alert("Invalid username or password");
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F1E8] flex overflow-hidden">
      {/* IMAGE SECTION */}
      <div className="hidden lg:block w-[65%]">
        <img
          src="/shepherd.jpg"
          alt="Poimen Exams"
          className="
            image-fade
            w-full
            h-screen
            object-cover
            object-center
          "
        />
      </div>

      {/* LOGIN SECTION */}
      <div
        className="
          w-full
          lg:w-[35%]
          flex
          items-center
          justify-center
          px-12
          lg:-ml-24
          z-10
        "
      >
        <div className="w-full max-w-md">
          <h1
            className="
              text-center
              text-6xl
              tracking-[0.15em]
             text-[#605A39]
              font-semibold
            "
            style={{
              fontFamily: "Cormorant Garamond",
            }}
          >
            POIMEN • EXAMS
          </h1>

          <p
            className="
              text-center
            text-[#7B7350]
              text-lg
              mb-12
              tracking-wide
            "
          >
            Please login here
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="
                  block
                  mb-2
                  text-[#605A39]
                  font-medium
                "
              >
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="
                   w-full
                    bg-transparent
                    border-b
                    border-[#CFC5A8]
                    py-3
                    text-lg
                    text-[#605A39]
                    placeholder:text-[#B7AC89]
                    focus:border-[#8A8250]
                    transition
                "
              />
            </div>

            <div>
              <label
                className="
                  block
                  mb-2
                  text-[#605A39]
                  font-medium
                "
              >
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                   w-full
                    bg-transparent
                    border-b
                    border-[#CFC5A8]
                    py-3
                    text-lg
                    text-[#605A39]
                    placeholder:text-[#B7AC89]
                    focus:border-[#8A8250]
                    transition
                "
              />
            </div>

            <button
              type="submit"
              className="
                w-full
                mt-6
                py-4
                rounded-full
                bg-[#8A8250]
                hover:bg-[#746c43]
                text-white
                tracking-[0.25em]
                font-medium
                transition-all
                duration-300
              "
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
