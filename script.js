/**
 * Comprueba si num es primo.
 * @param {number} num
 * @returns {boolean}
 */
function isPrime(num) {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  const limit = Math.floor(Math.sqrt(num));
  for (let i = 3; i <= limit; i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

/**
 * Algoritmo extendido de Euclides.
 * Devuelve { gcd, x, y } tal que gcd = a*x + b*y.
 */
function extendedGCD(a, b) {
  if (b === 0) return { gcd: a, x: 1, y: 0 };
  const { gcd, x: x1, y: y1 } = extendedGCD(b, a % b);
  return {
    gcd,
    x: y1,
    y: x1 - Math.floor(a / b) * y1
  };
}

/**
 * Busca el inverso modular de r módulo m.
 */
function buscaModularInverso(r, m) {
  const { gcd, x } = extendedGCD(r, m);
  if (gcd !== 1) return null;
  return ((x % m) + m) % m;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function buscaCoprimo(m) {
  let primo = 3;
  while (gcd(primo, m) !== 1) primo += 2;
  return primo;
}

function textoAAscii(texto) {
  const asciiCodes = [];
  for (let i = 0; i < texto.length; i++) {
    asciiCodes.push(texto.charCodeAt(i));
  }
  return asciiCodes;
}

function modPow(base, exp, mod) {
  base = BigInt(base);
  exp  = BigInt(exp);
  mod  = BigInt(mod);
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

function encryptAsciiArray(asciiCodes, r, n) {
  return asciiCodes.map(code => modPow(code, r, n));
}

function decryptAsciiArray(cifradoArray, s, n) {
  return cifradoArray
    .map(c => {
      const m = modPow(c, s, n);
      return String.fromCharCode(Number(m));
    })
    .join('');
}

function encriptar() {
  const texto = document.getElementById("messageToEncrypt").value;
  const p = +document.getElementById("p").value;
  const q = +document.getElementById("q").value;

  // Validar que p y q sean primos
  if (!isPrime(p) || !isPrime(q)) {
    alert("Error: Ambos p y q deben ser números primos.");
    return;
  }

  if (p === q) {
    alert("Error: p y q deben ser diferentes.");
    return;
  }

  if (p <= 7 || q <= 7) {
    alert("Error: p y q deben ser mayores que 7.");
    return;
  }

  const n = p * q;
  const m = (p - 1) * (q - 1);
  const r = buscaCoprimo(m);
  const s = buscaModularInverso(r, m);

  const textoEnASCII = textoAAscii(texto);
  const cifrado = encryptAsciiArray(textoEnASCII, r, n)
                    .map(x => x.toString());

  const resultado = document.getElementById("resultado");
  resultado.value =
    `Texto encriptado: ${cifrado.join(" ")}\n\n` +
    `Claves públicas: n = ${n}, r = ${r}\n` +
    `Clave privada: s = ${s}`;
}

function desencriptar() {
  const mensaje = document.getElementById("messageToDecrypt").value;
  const n = BigInt(document.getElementById("n").value);
  const s = BigInt(document.getElementById("s").value);

  const partes = mensaje
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(x => BigInt(x));

  const textoPlano = decryptAsciiArray(partes, s, n);
  document.getElementById("resultadoDesencriptar").value = textoPlano;
}

document.getElementById('copyEncryptedBtn').addEventListener('click', () => {
  const texto = document.getElementById('resultado').value;
  if (!texto) return; // no hay nada que copiar

  navigator.clipboard.writeText(texto)
    .then(() => {
      // opcional: mostrar mensaje breve
      const btn = document.getElementById('copyEncryptedBtn');
      btn.title = 'Copiado ✔';
      setTimeout(() => btn.title = 'Copiar al portapapeles', 2000);
    })
    .catch(err => {
      console.error('Error copiando al portapapeles:', err);
      alert('No se pudo copiar.');
    });
});