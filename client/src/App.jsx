import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import OtherPage from "./OtherPage";
import Fib from "./Fib";

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<header className="app-header">
				<Link to="/">Home</Link>
				<Link to="/otherpage">Other Page</Link>
			</header>
			
			<section id="center">
				<div>
					<Routes>
						<Route path="/" element={<Fib />} />
						<Route path="/otherpage" element={<OtherPage />} />
					</Routes>
				</div>
			</section>

			<div className="ticks"></div>
			<div className="ticks"></div>
			<section id="spacer"></section>
		</>
	);
}

export default App;
