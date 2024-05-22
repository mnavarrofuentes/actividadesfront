import RegistroUsuario from "./components/RegistroUsuario";

function App() {
  /*const [isLoading, setIsLoading] = useState(false);
  const handleClick = () => setIsLoading(!isLoading);
  const list = ["goku", "perro"];
  const handleSelect = (elemento: string) => {
    console.log(elemento);
  };
  const contenido = list.length ? (
    <List data={list} onSelect={handleSelect}></List>
  ) : (
    "Sin elementos"
  );
  const [data, setData] = useState(["goku", "ntajiro", "pepe"]);
  const addMinion = () => setData([...data, "Minion"]);
  const deleteMinion = () => setData(data.slice(0, -1));
  */

  return (
    <div className="App">
      <RegistroUsuario />
    </div>
  );
}

export default App;
