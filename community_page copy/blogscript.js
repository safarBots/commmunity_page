new Vue({
  el: '#app',
  data: {
    blogPosts: [],
    socket: null,
    loading: false,
    error: false,
    username: '',
    messages: []
  },
  mounted() {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      this.username = `${userData.firstName} ${userData.lastName}`;
    }
    this.initializeChat();
    this.requestBlogInteractions();
  },
  methods: {
    initializeChat() {
      this.socket = io('https://community-server-mbch.onrender.com');

      this.socket.on('connect', () => {
        this.socket.emit('request chat history');
        this.socket.emit('request blog interactions');
      });

      this.socket.on('chat history', (messages) => {
        messages.forEach(msg => this.appendChatMessage(msg));
      });

      this.socket.on('chat message', (msg) => {
        this.appendChatMessage(msg);
      });

      const chatBtn = document.getElementById('chat-btn');
      const chatModal = document.getElementById('chat-modal');
      const chatInput = document.getElementById('chat-input');
      const chatSend = document.getElementById('chat-send');
      const chatClose = document.getElementById('chat-close');

      // Add event listener for profile changes
      window.addEventListener('userDataUpdated', () => {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData) {
          this.username = `${userData.firstName} ${userData.lastName}`;
        }
      });

      chatBtn.addEventListener('click', () => {
        chatModal.classList.remove('hidden');
      });

      chatClose.addEventListener('click', () => {
        chatModal.classList.add('hidden');
      });

      chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) {
          chatModal.classList.add('hidden');
        }
      });

      chatInput.addEventListener('keyup', (event) => {
        const msg = chatInput.value.trim();
        if (event.key === 'Enter' && msg) {
          // Always check for latest username before sending
          const userData = JSON.parse(localStorage.getItem("userData"));
          const currentUsername = userData ? 
            `${userData.firstName} ${userData.lastName}` : 
            "Anonymous";
          
          const msgObj = { 
            username: currentUsername, 
            text: msg,
            timestamp: new Date().toISOString()
          };
          this.socket.emit('chat message', msgObj);
          chatInput.value = '';
        }
      });

      chatSend.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
          // Always check for latest username before sending
          const userData = JSON.parse(localStorage.getItem("userData"));
          const currentUsername = userData ? 
            `${userData.firstName} ${userData.lastName}` : 
            "Anonymous";
          
          const msgObj = { 
            username: currentUsername, 
            text: message,
            timestamp: new Date().toISOString()
          };
          this.socket.emit('chat message', msgObj);
          chatInput.value = '';
        }
      });

      this.socket.on('blog likes updated', ({ blogId, likes }) => {
        updateBlogLikes(blogId, likes);
      });

      this.socket.on('blog comments updated', ({ blogId, comments }) => {
        updateBlogComments(blogId, comments);
      });

      this.socket.on('blog interactions', (interactions) => {
        interactionData = interactions;
        renderBlogs(blogData);
      });
    },
    appendChatMessage(msg) {
      const chatMessages = document.getElementById('chat-messages');
      const messageElement = document.createElement('div');
      const time = new Date(msg.timestamp).toLocaleTimeString();
      
      messageElement.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <span class="font-bold text-blue-400">${msg.username}</span>
          <span class="text-xs text-gray-400">${time}</span>
        </div>
        <div class="text-white">${msg.text}</div>
      `;
      messageElement.classList.add('bg-gray-700', 'p-2', 'rounded', 'mb-2');
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    handleCommentKeyPress(event, blogId) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.addComment(blogId);
      }
    }
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//section 2

const accessKey = '75a07da6702dd911b3d0c6a7dfbe2795';
let blogData = [];

// Load saved interaction data
const loadInteractionData = () => {
  const savedData = localStorage.getItem('blogInteractions');
  return savedData ? JSON.parse(savedData) : {
    likes: {},
    comments: {}
  };
};

let interactionData = loadInteractionData();

async function fetchBlogs() {
  try {
    const response = await fetch(`https://api.mediastack.com/v1/news?access_key=${accessKey}&categories=health&limit=9&timestamp=${new Date().getTime()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.data) {
      blogData = data.data; // Store blog data globally
      renderBlogs(data.data);
    } else {
      console.error("No data available.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    const blogContainer = document.getElementById('blog-container');
    blogContainer.innerHTML = '<p class="text-red-500">Failed to load blogs. Please try again later.</p>';
  }
}

function renderBlogs(blogs) {
  const blogContainer = document.getElementById("blog-container");
  blogContainer.innerHTML = "";

  blogs.forEach((blog, index) => {
    const blogId = `blog-${blog.title.replace(/\s+/g, '-')}`;
    const likes = interactionData.likes[blogId] || 0;
    const comments = interactionData.comments[blogId] || [];

    const blogCard = document.createElement("div");
    blogCard.className = "bg-gray-800 shadow-xl rounded-lg overflow-hidden p-6 transition-transform transform hover:scale-105";
    blogCard.id = blogId;

    blogCard.innerHTML = `
      <h2 class="text-2xl font-semibold text-blue-500 mb-4">
        <a href="${blog.url}" target="_blank" class="text-blue-500 hover:underline">${blog.title}</a>
      </h2>
      <p class="text-gray-300 text-sm mb-4" id="content-${index}">${truncateContent(blog.description)}</p>
      <button onclick="toggleContent(${index})" class="text-blue-400 hover:underline mb-2">
        <a href="${blog.url}" target="_blank">Read More</a>
      </button>
      <div class="flex items-center justify-between mt-4">
        <button onclick="toggleLike('${blogId}')" class="text-gray-500 flex items-center space-x-1">
          <span id="like-icon-${blogId}">${interactionData.likes[blogId] ? '❤️' : '👍'}</span>
          <span id="like-count-${blogId}">${likes}</span>
        </button>
        <button onclick="toggleComment('${blogId}')" class="text-gray-500 flex items-center space-x-1">
          <span>💬</span><span>Comment (${comments.length})</span>
        </button>
      </div>
      <div id="comment-section-${blogId}" class="mt-4 hidden bg-blue-500 p-4 rounded-lg">
        <div class="relative">
          <textarea id="comment-input-${blogId}" 
            class="w-full p-3 mt-2 bg-gray-700 text-white rounded-md focus:outline-none" 
            placeholder="Write your comment..."
            onkeydown="handleCommentKeyPress(event, '${blogId}')"></textarea>
          <button onclick="addComment('${blogId}')" 
            class="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md">
            Submit
          </button>
        </div>
        <div id="comments-container-${blogId}" class="mt-4 space-y-2 text-sm text-gray-100">
          ${comments.map(comment => `
            <div class="bg-gray-700 p-3 rounded-md">
              <strong>${comment.username}:</strong> ${comment.text}
              <div class="text-xs text-gray-400">${new Date(comment.timestamp).toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    blogContainer.appendChild(blogCard);
  });
}

function truncateContent(content) {
  return content && content.length > 100 ? content.slice(0, 100) + "..." : content;
}

function toggleContent(index) {
  const contentElement = document.getElementById(`content-${index}`);
  const isTruncated = contentElement.innerText.endsWith("...");

  contentElement.innerText = isTruncated ? contentElement.innerText.replace("...", "") : contentElement.innerText.slice(0, 100) + "...";
}

function toggleComment(blogId) {
  const commentSection = document.getElementById(`comment-section-${blogId}`);
  commentSection.classList.toggle("hidden");
}

function toggleLike(blogId) {
  const vueApp = document.getElementById('app').__vue__;
  vueApp.socket.emit('blog like', { blogId });
}

function addComment(blogId) {
  const commentInput = document.getElementById(`comment-input-${blogId}`);
  const commentText = commentInput.value.trim();

  if (commentText) {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const username = userData ? `${userData.firstName} ${userData.lastName}` : "Anonymous";

    const newComment = {
      username,
      text: commentText,
      timestamp: new Date().toISOString()
    };

    const vueApp = document.getElementById('app').__vue__;
    vueApp.socket.emit('blog comment', {
      blogId,
      comment: newComment
    });

    commentInput.value = "";
  }
}

function updateBlogLikes(blogId, likes) {
  const likeCountElement = document.getElementById(`like-count-${blogId}`);
  const likeIconElement = document.getElementById(`like-icon-${blogId}`);
  
  if (likeCountElement && likeIconElement) {
    likeCountElement.textContent = likes;
    likeIconElement.textContent = likes > 0 ? '❤️' : '👍';
  }
}

function updateBlogComments(blogId, comments) {
  const commentsContainer = document.getElementById(`comments-container-${blogId}`);
  if (commentsContainer) {
    commentsContainer.innerHTML = comments.map(comment => `
      <div class="bg-gray-700 p-3 rounded-md">
        <strong>${comment.username}:</strong> ${comment.text}
        <div class="text-xs text-gray-400">${new Date(comment.timestamp).toLocaleString()}</div>
      </div>
    `).join('');
  }
}

fetchBlogs();


