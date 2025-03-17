/**
 * app.js - Arquivo JavaScript principal para o Dashboard Unyx
 * Contém todas as funcionalidades interativas, incluindo:
 * - Sistema de notificações
 * - Alternância de tema claro/escuro
 * - Funcionalidade de arrastar cards
 * - Autenticação básica
 * - Upload de arquivos
 */

document.addEventListener("DOMContentLoaded", () => {
  /**
   * PARTE 1: SISTEMA DE NOTIFICAÇÕES
   * Implementa um sistema completo de notificações com:
   * - Toast notifications temporárias
   * - Painel de notificações
   * - Persistência de notificações
   * - Contador de não lidas
   */
  class NotificationManager {
    constructor() {
      this.notifications = [];
      this.unreadCount = 0;
      this.navBadge = document.getElementById("nav-notification-badge");
      this.notificationsButton = document.getElementById(
        "notifications-button"
      );

      // Criar container para notificações toast se não existir
      this.container = document.getElementById("notification-container");
      if (!this.container) {
        this.container = document.createElement("div");
        this.container.id = "notification-container";
        this.container.className =
          "fixed top-16 right-4 w-80 z-50 space-y-2 pointer-events-none";
        document.body.appendChild(this.container);
      }

      // Carregar notificações salvas
      this.loadNotifications();

      // Configurar eventos
      this.setupEvents();
    }

    // Carregar notificações do armazenamento
    loadNotifications() {
      const savedNotifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      this.notifications = savedNotifications;
      this.updateUnreadCount();
    }

    // Salvar notificações no armazenamento
    saveNotifications() {
      localStorage.setItem("notifications", JSON.stringify(this.notifications));
    }

    // Configurar eventos
    setupEvents() {
      if (this.notificationsButton) {
        this.notificationsButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.toggleNotificationPanel();
        });
      }

      // Configurar botão de feedback
      const feedbackButton = document.getElementById("feedback-button");
      if (feedbackButton) {
        feedbackButton.addEventListener("click", () => {
          this.addNotification({
            title: "Feedback",
            message:
              "Obrigado pelo seu interesse! O formulário de feedback será implementado em breve.",
            type: "success",
          });
        });
      }

      // Configurar botão de teste
      const testButton = document.getElementById("test-notifications-button");
      if (testButton) {
        testButton.addEventListener("click", () => {
          this.createExampleNotifications();
        });
      }
    }

    // Atualizar contador de não lidas
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter((n) => !n.read).length;

      if (this.navBadge) {
        if (this.unreadCount > 0) {
          this.navBadge.textContent =
            this.unreadCount > 9 ? "9+" : this.unreadCount;
          this.navBadge.classList.remove("hidden");
        } else {
          this.navBadge.classList.add("hidden");
        }
      }
    }

    // Adicionar nova notificação
    addNotification(notification) {
      // Estrutura padrão de notificação
      const newNotification = {
        id: Date.now().toString(),
        title: notification.title || "Notificação",
        message: notification.message || "",
        type: notification.type || "info", // info, success, warning, error
        timestamp: notification.timestamp || new Date().toISOString(),
        read: false,
      };

      // Adicionar ao início da lista
      this.notifications.unshift(newNotification);

      // Limitar a 50 notificações
      if (this.notifications.length > 50) {
        this.notifications = this.notifications.slice(0, 50);
      }

      // Salvar e atualizar contador
      this.saveNotifications();
      this.updateUnreadCount();

      // Mostrar notificação na tela
      this.showToast(newNotification);

      return newNotification.id;
    }

    // Marcar notificação como lida
    markAsRead(id) {
      const notification = this.notifications.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
        this.saveNotifications();
        this.updateUnreadCount();
      }
    }

    // Marcar todas como lidas
    markAllAsRead() {
      this.notifications.forEach((n) => (n.read = true));
      this.saveNotifications();
      this.updateUnreadCount();
    }

    // Remover notificação
    removeNotification(id) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
      this.saveNotifications();
      this.updateUnreadCount();
    }

    // Limpar todas as notificações
    clearAll() {
      this.notifications = [];
      this.saveNotifications();
      this.updateUnreadCount();
    }

    // Mostrar notificação temporária (toast)
    showToast(notification) {
      const toast = document.createElement("div");

      // Definir classes com base no tipo
      let typeClasses = "bg-blue-500 border-blue-600"; // info (padrão)
      let typeIcon = "fa-info-circle";

      if (notification.type === "success") {
        typeClasses = "bg-green-500 border-green-600";
        typeIcon = "fa-check-circle";
      } else if (notification.type === "warning") {
        typeClasses = "bg-yellow-500 border-yellow-600";
        typeIcon = "fa-exclamation-triangle";
      } else if (notification.type === "error") {
        typeClasses = "bg-red-500 border-red-600";
        typeIcon = "fa-exclamation-circle";
      }

      // Criar o elemento toast
      toast.className = `transform transition-all duration-300 translate-x-full opacity-0 ${typeClasses} border-l-4 rounded shadow-lg p-4 mb-4 pointer-events-auto`;
      toast.innerHTML = `
        <div class="flex items-start">
          <div class="flex-shrink-0 mr-3">
            <i class="fas ${typeIcon} text-white"></i>
          </div>
          <div class="flex-1">
            <h4 class="text-white font-medium">${notification.title}</h4>
            <p class="text-white text-sm opacity-90">${notification.message}</p>
          </div>
          <button class="ml-4 text-white opacity-75 hover:opacity-100 focus:outline-none" onclick="event.stopPropagation();">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;

      // Adicionar ao container
      this.container.appendChild(toast);

      // Animar entrada
      setTimeout(() => {
        toast.classList.remove("translate-x-full", "opacity-0");
      }, 10);

      // Configurar evento de clique para fechar
      toast.querySelector("button").addEventListener("click", () => {
        // Animar saída
        toast.classList.add("translate-x-full", "opacity-0");
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      });

      // Configurar evento de clique para marcar como lida
      toast.addEventListener("click", () => {
        this.markAsRead(notification.id);
        // Animar saída
        toast.classList.add("translate-x-full", "opacity-0");
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      });

      // Remover automaticamente após 5 segundos
      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.add("translate-x-full", "opacity-0");
          setTimeout(() => {
            if (toast.parentNode) {
              toast.parentNode.removeChild(toast);
            }
          }, 300);
        }
      }, 5000);
    }
    // Alternar o painel de notificações
    toggleNotificationPanel() {
      let panel = document.getElementById("notification-panel");

      if (panel) {
        // Fechar painel existente
        panel.classList.add("translate-y-2", "opacity-0");
        setTimeout(() => {
          if (panel.parentNode) {
            panel.parentNode.removeChild(panel);
          }
        }, 300);

        // Remover destaque do botão
        if (this.notificationsButton) {
          this.notificationsButton.classList.remove("text-white");
          this.notificationsButton.classList.add("text-gray-400");
        }

        return;
      }

      // Destacar o botão quando o painel estiver aberto
      if (this.notificationsButton) {
        this.notificationsButton.classList.remove("text-gray-400");
        this.notificationsButton.classList.add("text-white");
      }

      // Criar painel de notificações
      panel = document.createElement("div");
      panel.id = "notification-panel";
      panel.className =
        "fixed z-40 bg-gray-800 rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 opacity-0 translate-y-2";

      // Posicionar o painel abaixo do botão de notificações
      const buttonRect = this.notificationsButton.getBoundingClientRect();
      panel.style.top = buttonRect.bottom + window.scrollY + "px";
      panel.style.left = buttonRect.left + "px";
      panel.style.width = "320px";
      panel.style.maxHeight = "80vh";

      // Ajustar posicionamento em telas pequenas
      if (window.innerWidth < 640) {
        panel.style.width = "90vw";
        panel.style.left = "5vw";
      }

      // Aplicar tema claro se necessário
      const isDarkMode = !document.body.classList.contains("light-theme");
      if (!isDarkMode) {
        panel.classList.remove("bg-gray-800");
        panel.classList.add("bg-white", "text-gray-800");
      }

      // Cabeçalho do painel
      const header = document.createElement("div");
      header.className =
        "p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10";

      if (!isDarkMode) {
        header.classList.remove("border-gray-700", "bg-gray-800");
        header.classList.add("border-gray-200", "bg-white");
      }

      header.innerHTML = `
        <h3 class="font-medium">Notificações</h3>
        <div class="space-x-2">
          <button id="mark-all-read" class="text-sm text-blue-400 hover:text-blue-300">Marcar todas</button>
          <button id="clear-all" class="text-sm text-red-400 hover:text-red-300">Limpar</button>
        </div>
      `;

      // Lista de notificações
      const list = document.createElement("div");
      list.className = "overflow-y-auto";
      list.style.maxHeight = "calc(80vh - 60px)"; // Altura máxima menos o cabeçalho

      if (this.notifications.length === 0) {
        list.innerHTML = `
          <div class="p-6 text-center text-gray-400">
            <i class="fas fa-bell-slash text-4xl mb-3"></i>
            <p>Não há notificações</p>
          </div>
        `;
      } else {
        // Renderizar notificações
        this.notifications.forEach((notification) => {
          const item = document.createElement("div");
          item.className = `p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${
            notification.read ? "opacity-60" : ""
          }`;

          if (!isDarkMode) {
            item.classList.remove("border-gray-700", "hover:bg-gray-700");
            item.classList.add("border-gray-200", "hover:bg-gray-100");
          }

          // Formatar data
          const date = new Date(notification.timestamp);
          const formattedDate =
            date.toLocaleDateString() +
            " " +
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          // Ícone com base no tipo
          let typeIcon = "fa-info-circle text-blue-400";
          if (notification.type === "success")
            typeIcon = "fa-check-circle text-green-400";
          if (notification.type === "warning")
            typeIcon = "fa-exclamation-triangle text-yellow-400";
          if (notification.type === "error")
            typeIcon = "fa-exclamation-circle text-red-400";

          item.innerHTML = `
            <div class="flex items-start">
              <div class="flex-shrink-0 mr-3">
                <i class="fas ${typeIcon}"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-medium">${notification.title}</h4>
                <p class="text-sm opacity-90">${notification.message}</p>
                <p class="text-xs opacity-60 mt-1">${formattedDate}</p>
              </div>
              ${
                !notification.read
                  ? '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>'
                  : ""
              }
            </div>
          `;

          // Evento de clique para marcar como lida
          item.addEventListener("click", () => {
            this.markAsRead(notification.id);
            item.classList.add("opacity-60");
            const indicator = item.querySelector(".bg-blue-500");
            if (indicator) indicator.remove();
          });

          list.appendChild(item);
        });
      }

      // Rodapé do painel
      const footer = document.createElement("div");
      footer.className =
        "p-3 text-center text-xs text-gray-500 border-t border-gray-700 bg-gray-800";

      if (!isDarkMode) {
        footer.classList.remove("border-gray-700", "bg-gray-800");
        footer.classList.add("border-gray-200", "bg-white");
      }

      footer.innerHTML = `
        <p>Gerencie suas preferências de notificação nas <a href="#" class="text-blue-400 hover:underline">configurações</a>.</p>
      `;

      // Montar o painel
      panel.appendChild(header);
      panel.appendChild(list);
      panel.appendChild(footer);
      document.body.appendChild(panel);

      // Animar entrada
      setTimeout(() => {
        panel.classList.remove("translate-y-2", "opacity-0");
      }, 10);

      // Configurar eventos
      document
        .getElementById("mark-all-read")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          this.markAllAsRead();

          // Atualizar visualmente todas as notificações
          const items = panel.querySelectorAll(".border-b:not(.opacity-60)");
          items.forEach((item) => {
            item.classList.add("opacity-60");
            const indicator = item.querySelector(".bg-blue-500");
            if (indicator) indicator.remove();
          });
        });

      document.getElementById("clear-all").addEventListener("click", (e) => {
        e.stopPropagation();
        this.clearAll();
        this.toggleNotificationPanel(); // Fechar
      });

      // Fechar ao clicar fora
      const closePanel = (e) => {
        if (
          !panel.contains(e.target) &&
          e.target !== this.notificationsButton &&
          !this.notificationsButton.contains(e.target)
        ) {
          this.toggleNotificationPanel();
          document.removeEventListener("click", closePanel);
        }
      };

      // Adicionar com delay para evitar fechamento imediato
      setTimeout(() => {
        document.addEventListener("click", closePanel);
      }, 100);
    }

    // Criar notificações de exemplo
    createExampleNotifications() {
      // Tipos diferentes de notificações
      const types = [
        {
          title: "Atualização disponível",
          message:
            "Uma nova versão do dashboard está disponível. Atualize para acessar os novos recursos.",
          type: "info",
        },
        {
          title: "Tarefa concluída",
          message: "A importação de dados foi concluída com sucesso.",
          type: "success",
        },
        {
          title: "Atenção necessária",
          message: "Alguns itens precisam de sua revisão antes de prosseguir.",
          type: "warning",
        },
        {
          title: "Erro de sincronização",
          message:
            "Não foi possível sincronizar com o servidor. Tente novamente mais tarde.",
          type: "error",
        },
      ];

      // Adicionar notificações com intervalo
      types.forEach((notification, index) => {
        setTimeout(() => {
          this.addNotification(notification);
        }, index * 1000);
      });
    }
  }

  /**
   * PARTE 2: SISTEMA DE TEMA CLARO/ESCURO
   * Implementa a alternância entre temas e salva a preferência do usuário
   */
  class ThemeManager {
    constructor() {
      this.darkLightToggle = document.getElementById("dark-light-toggle");
      this.modeIcon = document.getElementById("mode-icon");

      if (this.darkLightToggle) {
        // Conectar evento ao botão
        this.darkLightToggle.addEventListener("click", () =>
          this.toggleTheme()
        );

        // Carregar tema salvo
        this.loadSavedTheme();
      }
    }

    // Alternar entre modo claro e escuro
    toggleTheme() {
      const body = document.body;
      const isDarkMode = !body.classList.contains("light-theme");

      if (isDarkMode) {
        // Mudar para modo claro
        body.classList.add("light-theme");

        // Atualizar texto e ícone
        this.modeIcon.classList.remove("fa-moon");
        this.modeIcon.classList.add("fa-sun");
        this.darkLightToggle.querySelector("span").textContent =
          "Mudar para escuro";
      } else {
        // Mudar para modo escuro
        body.classList.remove("light-theme");

        // Atualizar texto e ícone
        this.modeIcon.classList.remove("fa-sun");
        this.modeIcon.classList.add("fa-moon");
        this.darkLightToggle.querySelector("span").textContent =
          "Mudar para claro";
      }

      // Fechar o painel de notificações se estiver aberto
      const panel = document.getElementById("notification-panel");
      if (panel && window.notificationManager) {
        window.notificationManager.toggleNotificationPanel();
      }

      // Salvar preferência do usuário
      localStorage.setItem("theme", isDarkMode ? "light" : "dark");
    }

    // Carregar tema salvo
    loadSavedTheme() {
      const savedTheme = localStorage.getItem("theme");
      const body = document.body;
      const currentIsDark = !body.classList.contains("light-theme");

      if (savedTheme === "light" && currentIsDark) {
        this.toggleTheme(); // Mudar para claro se estiver salvo como claro
      } else if (savedTheme === "dark" && !currentIsDark) {
        this.toggleTheme(); // Mudar para escuro se estiver salvo como escuro
      }
    }
  }

  /**
   * PARTE 3: SISTEMA DE ARRASTAR CARDS
   * Implementa a funcionalidade de arrastar e reorganizar cards
   */
  class DraggableCards {
    constructor() {
      this.cards = document.querySelectorAll(".bg-gray-800.p-4.rounded");
      this.draggedCard = null;
      this.initialX = 0;
      this.initialY = 0;
      this.currentX = 0;
      this.currentY = 0;
      this.xOffset = 0;
      this.yOffset = 0;

      this.setupEvents();
    }

    setupEvents() {
      // Adicionar eventos para cada card
      this.cards.forEach((card) => {
        // Selecionar o botão de mover corretamente
        const moveButton = card
          .querySelector(".fa-arrows-alt")
          .closest("button");

        if (moveButton) {
          // Adicionar eventos apenas ao botão de mover
          moveButton.addEventListener(
            "mousedown",
            (e) => {
              e.stopPropagation(); // Impedir propagação para o card
              this.dragStart(e);
            },
            false
          );

          moveButton.addEventListener(
            "touchstart",
            (e) => {
              e.stopPropagation(); // Impedir propagação para o card
              this.dragStart(e);
            },
            false
          );
        }

        // Remover os eventos de mousedown do card inteiro
        // para que apenas o botão de mover inicie o arrasto
      });

      document.addEventListener("mousemove", (e) => this.drag(e), false);
      document.addEventListener("touchmove", (e) => this.drag(e), false);
      document.addEventListener("mouseup", () => this.dragEnd(), false);
      document.addEventListener("touchend", () => this.dragEnd(), false);
    }

    dragStart(e) {
      // Não precisamos mais verificar se o clique foi em um botão
      // já que agora só o botão de mover inicia o arrasto

      if (e.type === "touchstart") {
        this.initialX = e.touches[0].clientX - this.xOffset;
        this.initialY = e.touches[0].clientY - this.yOffset;
      } else {
        this.initialX = e.clientX - this.xOffset;
        this.initialY = e.clientY - this.yOffset;
      }

      // Obter o card pai do botão clicado
      const card = e.target.closest(".bg-gray-800.p-4.rounded");
      if (card) {
        this.draggedCard = card;
        this.draggedCard.classList.add("cursor-grabbing");
        this.draggedCard.classList.add("opacity-75");
        this.draggedCard.classList.add("z-50");
        this.draggedCard.style.position = "absolute";

        // Salvar dimensões originais
        this.draggedCard.dataset.originalWidth =
          this.draggedCard.offsetWidth + "px";
        this.draggedCard.style.width = this.draggedCard.offsetWidth + "px";
        this.draggedCard.style.height = this.draggedCard.offsetHeight + "px";
      }
    }
    dragEnd() {
      if (!this.draggedCard) return;

      this.initialX = this.currentX;
      this.initialY = this.currentY;

      // Restaurar o card para sua posição no grid
      this.draggedCard.style.position = "";
      this.draggedCard.style.transform = "";
      this.draggedCard.style.top = "";
      this.draggedCard.style.left = "";
      this.draggedCard.style.width = "";
      this.draggedCard.style.height = "";
      this.draggedCard.classList.remove("cursor-grabbing");
      this.draggedCard.classList.remove("opacity-75");
      this.draggedCard.classList.remove("z-50");

      // Reorganizar o grid se necessário
      const grid = document.querySelector(".grid");
      if (grid) {
        const cards = Array.from(grid.querySelectorAll(".card"));
        const cardIndex = cards.indexOf(this.draggedCard);

        // Aqui você pode implementar a lógica para reorganizar os cards
        // com base na posição final do card arrastado
      }

      this.draggedCard = null;
    }

    drag(e) {
      if (!this.draggedCard) return;

      e.preventDefault();

      if (e.type === "touchmove") {
        this.currentX = e.touches[0].clientX - this.initialX;
        this.currentY = e.touches[0].clientY - this.initialY;
      } else {
        this.currentX = e.clientX - this.initialX;
        this.currentY = e.clientY - this.initialY;
      }

      this.xOffset = this.currentX;
      this.yOffset = this.currentY;

      this.draggedCard.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
    }
  }
  /**
   * PARTE 4: SISTEMA DE UPLOAD DE ARQUIVOS
   * Implementa a funcionalidade de arrastar e soltar para upload
   */
  class FileUploadManager {
    constructor() {
      this.resourcesCard = document.querySelector(
        '.card h2:contains("Resources")'
      );

      if (this.resourcesCard) {
        this.resourcesCard = this.resourcesCard.closest(".card");
        this.dropZone = this.resourcesCard.querySelector(".border-dashed");
        this.setupEvents();
      }
    }

    setupEvents() {
      if (!this.dropZone) return;

      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        this.dropZone.addEventListener(
          eventName,
          (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
          false
        );
      });

      ["dragenter", "dragover"].forEach((eventName) => {
        this.dropZone.addEventListener(
          eventName,
          () => {
            this.dropZone.classList.add("border-blue-500");
            this.dropZone.classList.add("bg-blue-900");
            this.dropZone.classList.add("bg-opacity-10");
          },
          false
        );
      });

      ["dragleave", "drop"].forEach((eventName) => {
        this.dropZone.addEventListener(
          eventName,
          () => {
            this.dropZone.classList.remove("border-blue-500");
            this.dropZone.classList.remove("bg-blue-900");
            this.dropZone.classList.remove("bg-opacity-10");
          },
          false
        );
      });

      this.dropZone.addEventListener(
        "drop",
        (e) => {
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            this.handleFiles(files);
          }
        },
        false
      );

      // Adicionar suporte para clique também
      this.dropZone.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.style.display = "none";

        input.addEventListener("change", (e) => {
          if (e.target.files.length > 0) {
            this.handleFiles(e.target.files);
          }

          // Remover o input após o uso
          document.body.removeChild(input);
        });

        document.body.appendChild(input);
        input.click();
      });
    }

    handleFiles(files) {
      // Simular upload de arquivos
      if (window.notificationManager) {
        window.notificationManager.addNotification({
          title: "Upload iniciado",
          message: `Iniciando upload de ${files.length} arquivo(s)...`,
          type: "info",
        });

        setTimeout(() => {
          window.notificationManager.addNotification({
            title: "Upload concluído",
            message: `${files.length} arquivo(s) enviado(s) com sucesso.`,
            type: "success",
          });
        }, 2000);
      }

      // Aqui você implementaria a lógica real de upload
      console.log("Arquivos para upload:", files);
    }
  }

  /**
   * PARTE 5: SISTEMA DE AUTENTICAÇÃO
   * Implementa funcionalidade básica de login/logout
   */
  class AuthManager {
    constructor() {
      this.authButton = document.getElementById("auth-button");
      this.authButtonText = document.getElementById("auth-button-text");
      this.userName = document.getElementById("user-account-name");
      this.userLogo = document.getElementById("user-logo");

      // Verificar se o usuário está logado
      this.isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      this.updateUI();
      this.setupEvents();
    }

    updateUI() {
      if (this.isLoggedIn) {
        this.authButtonText.innerText = "Perfil";
        this.userName.classList.remove("hidden");
        this.userName.innerText = localStorage.getItem("userName") || "Usuário";
        this.userLogo.innerText = localStorage.getItem("userInitials") || "U";
      } else {
        this.authButtonText.innerText = "Login";
        this.userName.classList.add("hidden");
        this.userLogo.innerText = "A"; // Letra inicial padrão
      }
    }

    setupEvents() {
      if (this.authButton) {
        this.authButton.addEventListener("click", () => {
          if (this.isLoggedIn) {
            this.showProfileMenu();
          } else {
            this.showLoginForm();
          }
        });
      }
    }

    showLoginForm() {
      // Criar modal de login
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

      const form = document.createElement("div");
      form.className = "bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md";

      // Verificar tema atual
      if (document.body.classList.contains("light-theme")) {
        form.classList.remove("bg-gray-800");
        form.classList.add("bg-white", "text-gray-800");
      }

      form.innerHTML = `
          <h2 class="text-xl font-bold mb-4">Login</h2>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1" for="email">Email</label>
            <input type="email" id="email" class="w-full p-2 rounded bg-gray-700 text-white" placeholder="seu@email.com">
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium mb-1" for="password">Senha</label>
            <input type="password" id="password" class="w-full p-2 rounded bg-gray-700 text-white" placeholder="********">
          </div>
          <div class="flex justify-between items-center">
            <button id="login-submit" class="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700 transition-colors">Entrar</button>
            <button id="login-cancel" class="text-gray-400 hover:text-white">Cancelar</button>
          </div>
        `;

      // Ajustar cores para tema claro
      if (document.body.classList.contains("light-theme")) {
        const inputs = form.querySelectorAll("input");
        inputs.forEach((input) => {
          input.classList.remove("bg-gray-700", "text-white");
          input.classList.add(
            "bg-gray-100",
            "text-gray-800",
            "border",
            "border-gray-300"
          );
        });

        const cancelButton = form.querySelector("#login-cancel");
        cancelButton.classList.remove("hover:text-white");
        cancelButton.classList.add("text-gray-600", "hover:text-gray-800");
      }

      modal.appendChild(form);
      document.body.appendChild(modal);

      // Focar no primeiro campo
      setTimeout(() => {
        form.querySelector("#email").focus();
      }, 100);

      // Configurar eventos
      form.querySelector("#login-cancel").addEventListener("click", () => {
        document.body.removeChild(modal);
      });

      form.querySelector("#login-submit").addEventListener("click", () => {
        const email = form.querySelector("#email").value;
        const password = form.querySelector("#password").value;

        if (email && password) {
          // Simulação de login bem-sucedido
          this.isLoggedIn = true;
          localStorage.setItem("isLoggedIn", "true");

          // Extrair nome e iniciais do email
          const name = email.split("@")[0];
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
          const initials = formattedName.charAt(0).toUpperCase();

          localStorage.setItem("userName", formattedName);
          localStorage.setItem("userInitials", initials);

          this.updateUI();

          // Notificar o usuário
          if (window.notificationManager) {
            window.notificationManager.addNotification({
              title: "Login bem-sucedido",
              message: `Bem-vindo de volta, ${formattedName}!`,
              type: "success",
            });
          }

          document.body.removeChild(modal);
        } else {
          // Mostrar erro
          const errorMsg = document.createElement("p");
          errorMsg.className = "text-red-500 text-sm mt-2";
          errorMsg.textContent = "Por favor, preencha todos os campos.";

          // Remover mensagem de erro anterior, se existir
          const existingError = form.querySelector(".text-red-500");
          if (existingError) {
            existingError.remove();
          }

          form.querySelector(".mb-6").appendChild(errorMsg);
        }
      });
    }

    showProfileMenu() {
      // Criar menu de perfil
      const button = this.authButton;
      const buttonRect = button.getBoundingClientRect();

      const menu = document.createElement("div");
      menu.className =
        "absolute bg-gray-800 rounded-lg shadow-xl z-50 w-48 py-2 transform transition-all duration-300 opacity-0 translate-y-2";
      menu.style.top = buttonRect.bottom + window.scrollY + "px";
      menu.style.right = window.innerWidth - buttonRect.right + "px";

      // Verificar tema atual
      if (document.body.classList.contains("light-theme")) {
        menu.classList.remove("bg-gray-800");
        menu.classList.add("bg-white", "text-gray-800");
      }

      menu.innerHTML = `
          <div class="px-4 py-2 border-b border-gray-700">
            <p class="font-medium">${
              localStorage.getItem("userName") || "Usuário"
            }</p>
            <p class="text-sm text-gray-400">${
              localStorage.getItem("userEmail") || "usuario@exemplo.com"
            }</p>
          </div>
          <a href="#" class="block px-4 py-2 hover:bg-gray-700 transition-colors">Meu perfil</a>
          <a href="#" class="block px-4 py-2 hover:bg-gray-700 transition-colors">Configurações</a>
          <button id="logout-button" class="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400 hover:text-red-300">Sair</button>
        `;

      // Ajustar cores para tema claro
      if (document.body.classList.contains("light-theme")) {
        menu
          .querySelector(".border-gray-700")
          .classList.replace("border-gray-700", "border-gray-200");

        const menuItems = menu.querySelectorAll(".hover\\:bg-gray-700");
        menuItems.forEach((item) => {
          item.classList.remove("hover:bg-gray-700");
          item.classList.add("hover:bg-gray-100");
        });
      }

      document.body.appendChild(menu);

      // Animar entrada
      setTimeout(() => {
        menu.classList.remove("opacity-0", "translate-y-2");
      }, 10);

      // Configurar evento de logout
      menu.querySelector("#logout-button").addEventListener("click", () => {
        this.isLoggedIn = false;
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userName");
        localStorage.removeItem("userInitials");
        localStorage.removeItem("userEmail");

        this.updateUI();

        // Notificar o usuário
        if (window.notificationManager) {
          window.notificationManager.addNotification({
            title: "Logout realizado",
            message: "Você saiu da sua conta com sucesso.",
            type: "info",
          });
        }

        // Fechar menu
        closeMenu();
      });

      // Fechar ao clicar fora
      const closeMenu = () => {
        menu.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => {
          if (menu.parentNode) {
            menu.parentNode.removeChild(menu);
          }
        }, 300);
        document.removeEventListener("click", handleOutsideClick);
      };

      const handleOutsideClick = (e) => {
        if (
          !menu.contains(e.target) &&
          e.target !== button &&
          !button.contains(e.target)
        ) {
          closeMenu();
        }
      };

      // Adicionar com delay para evitar fechamento imediato
      setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
      }, 100);
    }

    logout() {
      this.isLoggedIn = false;
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userName");
      localStorage.removeItem("userInitials");
      localStorage.removeItem("userEmail");

      this.updateUI();
    }
  }

  /**
   * PARTE 6: INICIALIZAÇÃO DA APLICAÇÃO
   * Inicializa todos os gerenciadores e configura eventos globais
   */
  // Inicializar gerenciadores
  window.notificationManager = new NotificationManager();
  window.themeManager = new ThemeManager();
  window.draggableCards = new DraggableCards();
  window.fileUploadManager = new FileUploadManager();
  window.authManager = new AuthManager();

  // Adicionar notificação de boas-vindas após um breve delay
  setTimeout(() => {
    window.notificationManager.addNotification({
      title: "Bem-vindo ao Unyx Dashboard",
      message: "Explore os recursos e personalize sua experiência.",
      type: "info",
    });
  }, 1500);

  // Configurar eventos de redimensionamento
  window.addEventListener("resize", () => {
    // Fechar o painel de notificações se estiver aberto
    const panel = document.getElementById("notification-panel");
    if (panel && window.notificationManager) {
      window.notificationManager.toggleNotificationPanel();
    }

    // Ajustar layout conforme necessário
    const grid = document.querySelector(".grid");
    if (grid) {
      // Aqui você pode adicionar lógica para ajustar o layout em diferentes tamanhos de tela
    }
  });

  // Polyfill para o método :contains
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  if (!document.querySelector('h2:contains("Resources")')) {
    // Adicionar método :contains como uma função auxiliar
    window.containsText = function (element, text) {
      return element.textContent.includes(text);
    };

    // Usar a função auxiliar para encontrar elementos
    window.fileUploadManager.resourcesCard = Array.from(
      document.querySelectorAll("h2")
    )
      .find((el) => containsText(el, "Resources"))
      ?.closest(".card");
    if (window.fileUploadManager.resourcesCard) {
      window.fileUploadManager.dropZone =
        window.fileUploadManager.resourcesCard.querySelector(".border-dashed");
      window.fileUploadManager.setupEvents();
    }
  }
});
