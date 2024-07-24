 // Importa funções necessárias dos SDKs necessários 
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
 import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
 import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
 import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

 // Configuração do firebase
 const firebaseConfig = {
   apiKey:,
   authDomain:,
   projectId:,
   storageBucket:,
   messagingSenderId:,
   appId:,
   measurementId:
 }

 // Inicializar Firebase
 const app = initializeApp(firebaseConfig);
 const db = getFirestore(app);
 const auth = getAuth(app);
 const storage = getStorage(app);

 // Função para carregar agendamentos filtrados
 async function carregarAgendamentosFiltrados(filtros) {
  const tabela = document.getElementById('agendamentos-tabela').getElementsByTagName('tbody')[0];
  tabela.innerHTML = ''; // Limpa a tabela

  let q = collection(db, 'agendamentos');

  // Aplicar os filtros dinamicamente
  const conditions = [];
  if (filtros.nome) {
    conditions.push(where('nome', '==', filtros.nome));
  }
  if (filtros.sala) {
    conditions.push(where('sala', '==', filtros.sala));
  }
  if (filtros.turno) {
    conditions.push(where('turno', '==', filtros.turno));
  }
  if (filtros.horario) {
    conditions.push(where('horario', '==', filtros.horario));
  }
  if (filtros.data) {
    conditions.push(where('data', '==', filtros.data));
  }

  if (conditions.length > 0) {
    q = query(q, ...conditions);
  }

  try {
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = tabela.insertRow();
      row.insertCell(0).textContent = data.nome;
      row.insertCell(1).textContent = salasLegiveis[data.sala] || data.sala;
      row.insertCell(2).textContent = turnosLegiveis[data.turno] || data.turno;
      row.insertCell(3).textContent = horariosLegiveis[data.horario] || data.horario;
      row.insertCell(4).textContent = data.data;
      row.insertCell(5).textContent = data.planoAula; // Considerando que o link do plano de aula seja armazenado como planoAula
    });
  } catch (error) {
    console.error("Erro ao carregar agendamentos filtrados: ", error);
  }
}

// Listener para o botão de filtro
document.getElementById('filtro-button').addEventListener('click', () => {
  const nome = document.getElementById('filtro-nome').value;
  const sala = document.getElementById('filtro-sala-select').value;
  const turno = document.getElementById('filtro-turno').value;
  const horario = document.getElementById('filtro-horario').value;
  const data = document.getElementById('filtro-data').value;

  const filtros = {
    nome: nome || null,
    sala: sala || null,
    turno: turno || null,
    horario: horario || null,
    data: data || null
  };

  carregarAgendamentosFiltrados(filtros);
});

// Listener para o botão de remover filtros
document.getElementById('remover-filtro-button').addEventListener('click', () => {
  // Limpar os campos de filtro
  document.getElementById('filtro-nome').value = '';
  document.getElementById('filtro-sala-select').value = '';
  document.getElementById('filtro-turno').value = '';
  document.getElementById('filtro-horario').value = '';
  document.getElementById('filtro-data').value = '';

  // Carregar todos os agendamentos
  carregarTodosAgendamentos();
});

 // Mapeamento de valores técnicos para valores legíveis
 const salasLegiveis = {
   salaInformatica: "Sala de Informática",
   salaDanca: "Sala de Dança",
   salaMultifuncional: "Sala Multifuncional",
   salaLinguagens: "Sala de Linguagens",
   labBioQui: "Laboratório de Biologia/Química",
   labFisMat: "Laboratório de Física/Matemática",
   quadraPoliesportiva: "Quadra Poliesportiva",
   gramadoSintetico: "Gramado Sintético",
   pistaAtletismo: "Pista de Atletismo",
   salaProjecao9: "Sala de Projeção 09",
   salaProjecao10: "Sala de Projeção 10",
   salaProjecao11: "Sala de Projeção 11",
   salaProjecao12: "Sala de Projeção 12",
   teatro: "Teatro",
   biblioteca: "Biblioteca",
   projetor1: "Projetor 01",
   projetor2: "Projetor 02",
   projetor3: "Projetor 03"
 };

 const turnosLegiveis = {
   matutino: "Matutino",
   vespertino: "Vespertino",
   noturno: "Noturno"
 };

 const horariosLegiveis = {
   horario1: "1° Horário",
   horario2: "2° Horário",
   horario3: "3° Horário",
   horario4: "4° Horário",
   horario5: "5° Horário"
 };

 // Função para carregar e ordenar os agendamentos
 async function carregarAgendamentos() {
   const agendamentosRef = collection(db, "agendamentos");
   const q = query(agendamentosRef);
   const querySnapshot = await getDocs(q);

   // Coletar os dados e armazenar em uma matriz
   const agendamentos = [];
   querySnapshot.forEach((doc) => {
     agendamentos.push(doc.data());
   });

   // Ordenar os agendamentos pelo nome do professor
   agendamentos.sort((a, b) => a.nome.localeCompare(b.nome));

   // Atualizar a tabela com os agendamentos ordenados
   const tabela = document.querySelector("#agendamentos-tabela tbody");
   tabela.innerHTML = "";

   agendamentos.forEach((agendamento) => {
     const row = tabela.insertRow();
     row.insertCell(0).textContent = agendamento.nome;
     row.insertCell(1).textContent = salasLegiveis[agendamento.sala] || agendamento.sala;
     row.insertCell(2).textContent = turnosLegiveis[agendamento.turno] || agendamento.turno;
     row.insertCell(3).textContent = horariosLegiveis[agendamento.horario] || agendamento.horario;
     row.insertCell(4).textContent = agendamento.data;

     const planoAulaCell = row.insertCell(5);
     const linkPlanoAula = document.createElement('a');
     linkPlanoAula.href = agendamento.planoAulaURL;
     linkPlanoAula.textContent = 'Plano de Aula';
     linkPlanoAula.target = '_blank';
     planoAulaCell.appendChild(linkPlanoAula);
   });
 }
 
 carregarAgendamentos();
 
 // Lidar com autenticação e exibir/ocultar formulários com base no status de autenticação
 auth.onAuthStateChanged((user) => {
   const formContainer = document.getElementById('form-container');
   const authContainer = document.getElementById('auth-container');
   const logoutButton = document.getElementById('logout-button');

   if (user) {
     formContainer.style.display = 'block';
     authContainer.style.display = 'none';
     logoutButton.style.display = 'block';
     carregarAgendamentos();
   } else {
     formContainer.style.display = 'none';
     authContainer.style.display = 'block';
     logoutButton.style.display = 'none';
   }
 });
 
 // Função para criar um novo usuário
 document.getElementById('signup-form').addEventListener('submit', (e) => {
   e.preventDefault();
   const email = document.getElementById('signup-email').value;
   const password = document.getElementById('signup-password').value;

   createUserWithEmailAndPassword(auth, email, password)
     .then((userCredential) => {
       const user = userCredential.user;
       document.getElementById('signup-message').textContent = 'Usuário cadastrado com sucesso!';
     })
     .catch((error) => {
       const errorMessage = error.message;
       document.getElementById('signup-message').textContent = `Erro: ${errorMessage}`;
     });
 });
 
 // Função para fazer login
 document.getElementById('login-form').addEventListener('submit', (e) => {
   e.preventDefault();
   const email = document.getElementById('login-email').value;
   const password = document.getElementById('login-password').value;

   signInWithEmailAndPassword(auth, email, password)
     .then((userCredential) => {
       const user = userCredential.user;
       document.getElementById('login-message').textContent = 'Login realizado com sucesso!';
     })
     .catch((error) => {
       const errorMessage = error.message;
       document.getElementById('login-message').textContent = `Erro: ${errorMessage}`;
     });
 });
 
 // Função para fazer logout
 document.getElementById('logout-button').addEventListener('click', () => {
   signOut(auth).then(() => {
     document.getElementById('login-message').textContent = 'Logout realizado com sucesso!';
   }).catch((error) => {
     document.getElementById('login-message').textContent = `Erro: ${error.message}`;
   });
 });
 
 // Função para lidar com o envio do formulário de agendamento
 document.getElementById('agendamentos').addEventListener('submit', async (e) => {
   e.preventDefault();

   const nome = document.getElementById('nome').value;
   const sala = document.getElementById('sala').value;
   const turno = document.getElementById('turno').value;
   const horario = document.getElementById('horario').value;
   const data = document.getElementById('data').value;
   const arquivo = document.getElementById('arquivo').files[0];

   // Verificar se há um agendamento existente para a mesma sala, data, turno e horário
   const agendamentosRef = collection(db, "agendamentos");
   const q = query(agendamentosRef, where("sala", "==", sala), where("data", "==", data), where("turno", "==", turno), where("horario", "==", horario));
   const querySnapshot = await getDocs(q);

   if (!querySnapshot.empty) {
     document.getElementById('mensagem').textContent = "Já existe um agendamento para essa sala, data, turno e horário.";
     return;
   }

   // Fazer o upload do plano de aula
   const storageRef = ref(storage, 'planos_de_aula/' + arquivo.name);
   await uploadBytes(storageRef, arquivo);
   const planoAulaURL = await getDownloadURL(storageRef);

   // Adicionar o agendamento no Firestore
   try {
     await addDoc(collection(db, "agendamentos"), {
       nome: nome,
       sala: sala,
       turno: turno,
       horario: horario,
       data: data,
       planoAulaURL: planoAulaURL
     });

     document.getElementById('mensagem').textContent = "Agendamento realizado com sucesso!";
     carregarAgendamentos();
   } catch (e) {
     document.getElementById('mensagem').textContent = "Erro ao agendar: " + e.message;
   }
 });