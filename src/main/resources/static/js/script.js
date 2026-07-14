const API = {
    async request(method, path, body) {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(path, opts);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(err.message || `Erro ${res.status}`);
        }
        return res.status === 204 ? null : res.json();
    },
    get:    (p) => API.request('GET', p),
    post:   (p, b) => API.request('POST', p, b),
    put:    (p, b) => API.request('PUT', p, b),
    patch:  (p, b) => API.request('PATCH', p, b),
    delete: (p) => API.request('DELETE', p)
};

const State = { currentPage: 'dashboard', users: [], tickets: [], ticketsAll: [] };
const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

function showLoading(show = true) {
    document.getElementById('pageContent').innerHTML = show
        ? '<div class="loading">Carregando...</div>' : '';
}

function openModal(title, bodyHtml, wide = false) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    const modal = document.getElementById('modal');
    modal.className = 'modal' + (wide ? ' wide' : '');
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

function getSelectOptions(items, valueKey = 'id', labelKey = 'nome', emptyLabel = 'Selecione...') {
    let html = `<option value="">${emptyLabel}</option>`;
    items.forEach(i => { html += `<option value="${i[valueKey]}">${i[labelKey]}</option>`; });
    return html;
}

function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleString('pt-BR');
}

function statusBadge(s) { return `<span class="badge badge-${s.toLowerCase()}">${s.replace('_', ' ')}</span>`; }
function priorityBadge(p) { return `<span class="badge badge-${p.toLowerCase()}">${p}</span>`; }
function roleBadge(r) { return `<span class="badge badge-${r.toLowerCase()}">${r}</span>`; }

/* ---- DASHBOARD ---- */
async function renderDashboard() {
    showLoading(true);
    try {
        const [users, tickets] = await Promise.all([API.get('/api/users'), API.get('/api/tickets')]);
        State.users = users; State.ticketsAll = tickets;
        const abertos = tickets.filter(t => t.status === 'ABERTO');
        const andamento = tickets.filter(t => t.status === 'EM_ANDAMENTO');
        const fechados = tickets.filter(t => t.status === 'FECHADO');
        const tecnicos = users.filter(u => u.role === 'TECNICO');
        const clientes = users.filter(u => u.role === 'CLIENTE');

        document.getElementById('pageContent').innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">📋</div>
                    <div class="stat-info"><h4>${tickets.length}</h4><p>Total Chamados</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon yellow">🕐</div>
                    <div class="stat-info"><h4>${abertos.length}</h4><p>Abertos</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">⚙️</div>
                    <div class="stat-info"><h4>${andamento.length}</h4><p>Em Andamento</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">✅</div>
                    <div class="stat-info"><h4>${fechados.length}</h4><p>Fechados</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">👥</div>
                    <div class="stat-info"><h4>${users.length}</h4><p>Usuários</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">🔧</div>
                    <div class="stat-info"><h4>${tecnicos.length}</h4><p>Técnicos</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">👤</div>
                    <div class="stat-info"><h4>${clientes.length}</h4><p>Clientes</p></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3>Últimos Chamados</h3></div>
                <div class="card-body">
                    <div class="table-container">
                        <table>
                            <thead><tr><th>ID</th><th>Título</th><th>Status</th><th>Prioridade</th><th>Cliente</th><th>Abertura</th></tr></thead>
                            <tbody>${tickets.slice(0, 10).map(t => `
                                <tr style="cursor:pointer" onclick="showTicketDetail(${t.id})">
                                    <td>#${t.id}</td>
                                    <td>${t.titulo}</td>
                                    <td>${statusBadge(t.status)}</td>
                                    <td>${priorityBadge(t.prioridade)}</td>
                                    <td>${t.clienteNome}</td>
                                    <td>${formatDate(t.dataAbertura)}</td>
                                </tr>`).join('') || '<tr><td colspan="6" class="empty-state">Nenhum chamado</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;
    } catch (e) { toast(e.message, 'error'); showLoading(false); }
}

/* ---- USERS ---- */
function renderUserForm(user) {
    const isEdit = !!user;
    return `
        <form id="userForm">
            <div class="form-group">
                <label for="userNome">Nome</label>
                <input class="form-control" id="userNome" value="${isEdit ? user.nome : ''}" required>
            </div>
            <div class="form-group">
                <label for="userEmail">Email</label>
                <input type="email" class="form-control" id="userEmail" value="${isEdit ? user.email : ''}" required>
            </div>
            ${!isEdit ? `
            <div class="form-group">
                <label for="userSenha">Senha</label>
                <input type="password" class="form-control" id="userSenha" minlength="6" required>
            </div>` : ''}
            <div class="form-group">
                <label for="userRole">Perfil</label>
                <select class="form-control" id="userRole" required>
                    ${getSelectOptions([{id:'CLIENTE',nome:'Cliente'},{id:'TECNICO',nome:'Técnico'},{id:'ADMIN',nome:'Admin'}], 'id', 'nome', '')}
                </select>
            </div>
            <div class="modal-footer" style="padding:16px 0 0;border:none">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Criar'} Usuário</button>
            </div>
        </form>`;
}

async function renderUsers() {
    showLoading(true);
    try {
        State.users = await API.get('/api/users');
        document.getElementById('pageContent').innerHTML = `
            <div class="toolbar">
                <div class="toolbar-left"><h3 style="font-size:16px;font-weight:600">Todos os Usuários</h3></div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" onclick="openUserModal()">+ Novo Usuário</button>
                </div>
            </div>
            <div class="card">
                <div class="card-body" style="padding:0">
                    <div class="table-container">
                        <table>
                            <thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Perfil</th><th style="width:140px">Ações</th></tr></thead>
                            <tbody>${State.users.map(u => `
                                <tr>
                                    <td>#${u.id}</td>
                                    <td>${u.nome}</td>
                                    <td>${u.email}</td>
                                    <td>${roleBadge(u.role)}</td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-outline" onclick="openUserModal(${u.id})">Editar</button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Excluir</button>
                                        </div>
                                    </td>
                                </tr>`).join('') || '<tr><td colspan="5" class="empty-state"><p>Nenhum usuário cadastrado</p></td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;
    } catch (e) { toast(e.message, 'error'); } finally { showLoading(false); }
}

async function openUserModal(id) {
    let user = null;
    if (id) {
        try { user = await API.get(`/api/users/${id}`); } catch (e) { toast(e.message, 'error'); return; }
    }
    openModal(user ? 'Editar Usuário' : 'Novo Usuário', renderUserForm(user));
    if (user) document.getElementById('userRole').value = user.role;
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nome: document.getElementById('userNome').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            role: document.getElementById('userRole').value
        };
        try {
            if (user) {
                await API.put(`/api/users/${user.id}`, data);
                toast('Usuário atualizado com sucesso');
            } else {
                data.senha = document.getElementById('userSenha').value;
                await API.post('/api/users', data);
                toast('Usuário criado com sucesso');
            }
            closeModal();
            renderUsers();
        } catch (err) { toast(err.message, 'error'); }
    });
}

async function deleteUser(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
        await API.delete(`/api/users/${id}`);
        toast('Usuário excluído com sucesso');
        renderUsers();
    } catch (e) { toast(e.message, 'error'); }
}

/* ---- TICKETS ---- */
function renderTicketForm(ticket) {
    const isEdit = !!ticket;
    const clienteOptions = State.users.filter(u => u.role === 'CLIENTE' || u.role === 'ADMIN');
    return `
        <form id="ticketForm">
            <div class="form-group">
                <label for="ticketTitulo">Título</label>
                <input class="form-control" id="ticketTitulo" value="${isEdit ? ticket.titulo : ''}" required>
            </div>
            <div class="form-group">
                <label for="ticketDescricao">Descrição</label>
                <textarea class="form-control" id="ticketDescricao" required>${isEdit ? ticket.descricao : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="ticketPrioridade">Prioridade</label>
                <select class="form-control" id="ticketPrioridade" required>
                    ${getSelectOptions([{id:'BAIXA',nome:'Baixa'},{id:'MEDIA',nome:'Média'},{id:'ALTA',nome:'Alta'},{id:'URGENTE',nome:'Urgente'}], 'id', 'nome', '')}
                </select>
            </div>
            ${!isEdit ? `
            <div class="form-group">
                <label for="ticketCliente">Cliente</label>
                <select class="form-control" id="ticketCliente" required>
                    ${getSelectOptions(clienteOptions)}
                </select>
            </div>` : ''}
            <div class="modal-footer" style="padding:16px 0 0;border:none">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar' : 'Abrir'} Chamado</button>
            </div>
        </form>`;
}

async function renderTickets() {
    showLoading(true);
    try {
        [State.users, State.ticketsAll] = await Promise.all([API.get('/api/users'), API.get('/api/tickets')]);
        document.getElementById('pageContent').innerHTML = `
            <div class="toolbar">
                <div class="toolbar-left">
                    <h3 style="font-size:16px;font-weight:600">Chamados</h3>
                    <select class="form-control" style="width:auto" id="filterStatus" onchange="filterTickets()">
                        <option value="">Todos os status</option>
                        <option value="ABERTO">Abertos</option>
                        <option value="EM_ANDAMENTO">Em Andamento</option>
                        <option value="FECHADO">Fechados</option>
                        <option value="CANCELADO">Cancelados</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" onclick="openTicketModal()">+ Novo Chamado</button>
                </div>
            </div>
            <div class="card">
                <div class="card-body" style="padding:0">
                    <div class="table-container">
                        <table>
                            <thead><tr><th>ID</th><th>Título</th><th>Status</th><th>Prioridade</th><th>Cliente</th><th>Técnico</th><th>Abertura</th><th style="width:160px">Ações</th></tr></thead>
                            <tbody id="ticketTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        filterTickets();
    } catch (e) { toast(e.message, 'error'); } finally { showLoading(false); }
}

function filterTickets() {
    const status = document.getElementById('filterStatus').value;
    const filtered = status ? State.ticketsAll.filter(t => t.status === status) : State.ticketsAll;
    document.getElementById('ticketTableBody').innerHTML = filtered.map(t => `
        <tr>
            <td>#${t.id}</td>
            <td><a href="#" onclick="showTicketDetail(${t.id});return false" style="color:var(--primary);text-decoration:none;font-weight:500">${t.titulo}</a></td>
            <td>${statusBadge(t.status)}</td>
            <td>${priorityBadge(t.prioridade)}</td>
            <td>${t.clienteNome}</td>
            <td>${t.tecnicoNome || '<span style="color:var(--text-secondary)">Não atribuído</span>'}</td>
            <td>${formatDate(t.dataAbertura)}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline" onclick="openTicketModal(${t.id})">Editar</button>
                    ${!t.tecnicoId ? `<button class="btn btn-sm btn-outline" onclick="openAssignModal(${t.id})">Atribuir</button>` : ''}
                    ${t.status !== 'FECHADO' && t.status !== 'CANCELADO' ? `<button class="btn btn-sm btn-outline" onclick="changeTicketStatus(${t.id},'FECHADO')">Fechar</button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="deleteTicket(${t.id})">Excluir</button>
                </div>
            </td>
        </tr>`).join('') || '<tr><td colspan="8" class="empty-state"><p>Nenhum chamado encontrado</p></td></tr>';
}

async function openTicketModal(id) {
    let ticket = null;
    if (id) {
        try { ticket = await API.get(`/api/tickets/${id}`); } catch (e) { toast(e.message, 'error'); return; }
    }
    openModal(ticket ? 'Editar Chamado' : 'Novo Chamado', renderTicketForm(ticket));
    if (ticket) {
        document.getElementById('ticketPrioridade').value = ticket.prioridade;
    }
    document.getElementById('ticketForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            titulo: document.getElementById('ticketTitulo').value.trim(),
            descricao: document.getElementById('ticketDescricao').value.trim(),
            prioridade: document.getElementById('ticketPrioridade').value
        };
        try {
            if (ticket) {
                await API.put(`/api/tickets/${ticket.id}`, data);
                toast('Chamado atualizado com sucesso');
            } else {
                data.clienteId = parseInt(document.getElementById('ticketCliente').value);
                await API.post('/api/tickets', data);
                toast('Chamado criado com sucesso');
            }
            closeModal();
            renderTickets();
        } catch (err) { toast(err.message, 'error'); }
    });
}

async function openAssignModal(ticketId) {
    const tecnicos = State.users.filter(u => u.role === 'TECNICO' || u.role === 'ADMIN');
    if (!tecnicos.length) { toast('Nenhum técnico disponível', 'error'); return; }
    openModal('Atribuir Técnico', `
        <form id="assignForm">
            <div class="form-group">
                <label for="assignTecnico">Selecione o Técnico</label>
                <select class="form-control" id="assignTecnico" required>
                    ${getSelectOptions(tecnicos)}
                </select>
            </div>
            <div class="modal-footer" style="padding:16px 0 0;border:none">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Atribuir</button>
            </div>
        </form>`);
    document.getElementById('assignForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tecnicoId = document.getElementById('assignTecnico').value;
        if (!tecnicoId) { toast('Selecione um técnico', 'error'); return; }
        try {
            await API.patch(`/api/tickets/${ticketId}/assign/${tecnicoId}`);
            toast('Técnico atribuído com sucesso');
            closeModal();
            renderTickets();
        } catch (err) { toast(err.message, 'error'); }
    });
}

async function changeTicketStatus(id, status) {
    try {
        await API.patch(`/api/tickets/${id}/status?status=${status}`);
        toast(`Status alterado para ${status}`);
        renderTickets();
    } catch (e) { toast(e.message, 'error'); }
}

async function deleteTicket(id) {
    if (!confirm('Tem certeza que deseja excluir este chamado?')) return;
    try {
        await API.delete(`/api/tickets/${id}`);
        toast('Chamado excluído com sucesso');
        renderTickets();
    } catch (e) { toast(e.message, 'error'); }
}

async function showTicketDetail(id) {
    try {
        const [ticket, comments] = await Promise.all([
            API.get(`/api/tickets/${id}`),
            API.get(`/api/tickets/${id}/comments`)
        ]);
        openModal(`Chamado #${ticket.id} - ${ticket.titulo}`, `
            <div class="detail-grid">
                <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${statusBadge(ticket.status)}</span></div>
                <div class="detail-item"><span class="detail-label">Prioridade</span><span class="detail-value">${priorityBadge(ticket.prioridade)}</span></div>
                <div class="detail-item"><span class="detail-label">Cliente</span><span class="detail-value">${ticket.clienteNome}</span></div>
                <div class="detail-item"><span class="detail-label">Técnico</span><span class="detail-value">${ticket.tecnicoNome || 'Não atribuído'}</span></div>
                <div class="detail-item"><span class="detail-label">Abertura</span><span class="detail-value">${formatDate(ticket.dataAbertura)}</span></div>
                <div class="detail-item"><span class="detail-label">Fechamento</span><span class="detail-value">${formatDate(ticket.dataFechamento)}</span></div>
            </div>
            <div class="form-group" style="margin-top:16px">
                <label>Descrição</label>
                <p style="font-size:13px;line-height:1.6;color:var(--text-secondary);background:var(--bg);padding:12px;border-radius:6px">${ticket.descricao}</p>
            </div>
            <hr style="border:none;border-top:1px solid var(--border);margin:16px 0">
            <h4 style="font-size:14px;margin-bottom:12px">Comentários (${comments.length})</h4>
            <div class="comments-list" id="commentsList">
                ${comments.map(c => `
                    <div class="comment">
                        <div class="comment-header">
                            <span class="comment-author">${c.usuarioNome}</span>
                            <span>${formatDate(c.dataCriacao)}</span>
                        </div>
                        <div class="comment-text">${c.conteudo}</div>
                    </div>`).join('') || '<p style="color:var(--text-secondary);font-size:13px">Nenhum comentário ainda.</p>'}
            </div>
            <form id="commentForm" style="margin-top:12px">
                <div class="form-group" style="margin-bottom:8px">
                    <label for="commentUsuario">Usuário</label>
                    <select class="form-control" id="commentUsuario" required>
                        ${getSelectOptions(State.users)}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:8px">
                    <textarea class="form-control" id="commentText" placeholder="Digite seu comentário..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-sm">Enviar Comentário</button>
            </form>
        `, true);
        document.getElementById('commentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuarioId = parseInt(document.getElementById('commentUsuario').value);
            const conteudo = document.getElementById('commentText').value.trim();
            if (!usuarioId || !conteudo) return;
            try {
                await API.post(`/api/tickets/${id}/comments`, { usuarioId, conteudo });
                document.getElementById('commentText').value = '';
                toast('Comentário adicionado');
                showTicketDetail(id);
            } catch (err) { toast(err.message, 'error'); }
        });
    } catch (e) { toast(e.message, 'error'); }
}

/* ---- ROUTER ---- */
const pages = {
    dashboard: { title: 'Dashboard', render: renderDashboard },
    users:  { title: 'Usuários', render: renderUsers },
    tickets: { title: 'Chamados', render: renderTickets }
};

async function navigate(page) {
    State.currentPage = page;
    document.getElementById('pageTitle').textContent = pages[page].title;
    $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
    document.getElementById('sidebar').classList.remove('open');
    await pages[page].render();
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
    navigate('dashboard');
    document.querySelector('.sidebar-nav').addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (item) navigate(item.dataset.page);
    });
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('btnRefresh').addEventListener('click', () => navigate(State.currentPage));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});
