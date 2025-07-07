import React, { useState, useEffect, useCallback } from 'react';
import './PokemonFetcher.css';

const tipoMap = {
  "normal": "Normal",
  "fighting": "Lucha",
  "flying": "Volador",
  "poison": "Veneno",
  "ground": "Tierra",
  "rock": "Roca",
  "bug": "Bicho",
  "ghost": "Fantasma",
  "steel": "Acero",
  "fire": "Fuego",
  "water": "Agua",
  "grass": "Planta",
  "electric": "Eléctrico",
  "psychic": "Psíquico",
  "ice": "Hielo",
  "dragon": "Dragón",
  "dark": "Siniestro",
  "fairy": "Hada",
  "unknown": "Desconocido",
  "shadow": "Sombra"
};

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [criterioFiltro, setCriterioFiltro] = useState('nombre');
  const [pokemonesAleatorios, setPokemonesAleatorios] = useState([]);

  const traducirTipos = (tipos) => {
    return tipos.map(tipo => tipoMap[tipo] || tipo);  
  };

  const debounceSearch = useCallback(
    (searchTerm) => {
      if (!searchTerm) {
        setPokemones([]); // Si el campo de búsqueda está vacío no muestra resultados
        return;
      }

      setCargando(true);

     
      const fetchPokemones = async () => {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=100&offset=0`);
          if (!response.ok) {
            throw new Error('Error al cargar los Pokémon');
          }
          const data = await response.json();

          const fetchedPokemones = [];
          for (const pokemon of data.results) {
            const pokemonResponse = await fetch(pokemon.url);
            const pokemonData = await pokemonResponse.json();

            fetchedPokemones.push({
              id: pokemonData.id,
              nombre: pokemonData.name,
              imagen: pokemonData.sprites.front_default,
              tipos: traducirTipos(pokemonData.types.map(typeInfo => typeInfo.type.name)), 
            });
          }
          setPokemones(fetchedPokemones);
        } catch (err) {
          setError(err.message);
        } finally {
          setCargando(false);
        }
      };

      fetchPokemones();
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      debounceSearch(filtro);
    }, 500); 

    return () => clearTimeout(timer);
  }, [filtro, debounceSearch]);

  useEffect(() => {
    const fetchPokemonesAleatorios = async () => {
      try {
        setCargando(true);
        setError(null);

        const pokemonIds = new Set();
        while (pokemonIds.size < 4) {
          const randomId = Math.floor(Math.random() * 898) + 1; // número  de Pokémon en la PokeAPI
          pokemonIds.add(randomId);
        }

        const aleatorios = [];
        for (const id of pokemonIds) {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
          if (!response.ok) {
            throw new Error(`Error al cargar el Pokémon con ID ${id}: ${response.statusText}`);
          }
          const data = await response.json();
          aleatorios.push({
            id: data.id,
            nombre: data.name,
            imagen: data.sprites.front_default,
            tipos: traducirTipos(data.types.map(typeInfo => typeInfo.type.name)), 
          });
        }
        setPokemonesAleatorios(aleatorios);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchPokemonesAleatorios();
  }, []);

  const pokemonesFiltrados = pokemones.filter(pokemon => {
    if (criterioFiltro === 'nombre') {
      return pokemon.nombre.toLowerCase().includes(filtro.toLowerCase());
    } else if (criterioFiltro === 'tipo') {
      return pokemon.tipos.some(tipo => tipo.toLowerCase().includes(filtro.toLowerCase()));
    }
    return true;
  });

  if (error) {
    return <div className="pokemon-container error">Error: {error}</div>;
  }

  return (
    <div className='pokemon-container'>
      <h2>Tus 4 Pokémon Aleatorios</h2>
      <img className="pokeball" src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/029b8bd9-cb5a-41e4-9c7e-ee516face9bb/dayo3ow-7ac86c31-8b2b-4810-89f2-e6134caf1f2d.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzAyOWI4YmQ5LWNiNWEtNDFlNC05YzdlLWVlNTE2ZmFjZTliYlwvZGF5bzNvdy03YWM4NmMzMS04YjJiLTQ4MTAtODlmMi1lNjEzNGNhZjFmMmQuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.ooubhxjHp9PIMhVxvCFHziI6pxDAS8glXPWenUeomWs" alt="Descripción de la imagen"></img>
      <div className="pokemon-list random-list">
        {pokemonesAleatorios.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card">
            <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
            <img src={pokemon.imagen} alt={pokemon.nombre} /> 
            <p>
              <strong>Tipos:</strong> {pokemon.tipos.join(', ')}  
            </p>
          </div>
        ))}
      </div>

      <h3>- Buscar pokémon:</h3>
      <div>
        <input
          type="text"
          placeholder="Buscar Pokémon"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <select onChange={(e) => setCriterioFiltro(e.target.value)}>
          <option value="nombre">Por Nombre</option>
          <option value="tipo">Por Tipo</option>
        </select>
      </div>
      <img className='otrogif' src="/src/multimedia/gif.gif" alt="" />

      
      {filtro && (
        <>
          <h2>Tus Pokémon Filtrados</h2>
          <div className="pokemon-list">
            {pokemonesFiltrados.length > 0 ? (
              pokemonesFiltrados.map(pokemon => (
                <div key={pokemon.id} className="pokemon-card">
                  <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
                  <img src={pokemon.imagen} alt={pokemon.nombre} />
                  <p>
                    <strong>Tipos:</strong> {pokemon.tipos.join(', ')}  
                  </p>
                </div>
              ))
            ) : (
              <p>No se encontraron Pokémon con ese criterio.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonFetcher;
