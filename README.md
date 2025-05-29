# React Copilot Widget

A React component library for integrating the Copilot chat widget into your applications. This library provides a flexible and type-safe way to manage single or multiple Copilot instances with custom tools and user configurations.

## ✨ Features

- 🔄 **Multiple Mode Support**: Run single or multiple Copilot instances simultaneously
- 🛠 **Custom Tools Integration**: Easy registration and management of custom tools with async handler support
- 👥 **User Management**: Set and manage user configurations for personalized experiences
- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions and safe bot name validation
- ⚡ **Lightweight**: Minimal dependencies with only React as a peer dependency
- 🔌 **Easy Integration**: Simple React components and hooks for quick implementation
- 🪝 **React Hooks**: Dedicated hooks for accessing Copilot instances, tools, and user management

## 📦 Installation

```bash
npm install react-copilot-widget
# or
yarn add react-copilot-widget
```

## 🚀 Usage
Basic Setup (Single Instance)

```tsx
import { CopilotProvider } from 'react-copilot-widget';

function App() {
  return (
    <CopilotProvider
      token="your-copilot-token"
      config={{
        // Your Copilot configuration
        theme: 'light',
        position: 'bottom-right'
      }}
      botName="myCopilot" // Optional custom name
    >
      {/* Your app content */}
    </CopilotProvider>
  );
}
```
Multiple Instances

```tsx
import { CopilotProvider } from 'react-copilot-widget';

function App() {
  return (
    <CopilotProvider
      instances={[
        {
          token: 'token-1',
          botName: 'copilot1',
          config: { theme: 'light' }
        },
        {
          token: 'token-2',
          botName: 'copilot2',
          config: { theme: 'dark' }
        }
      ]}
    >
      {/* Your app content */}
    </CopilotProvider>
  );
}
```
Adding Custom Tools

```tsx
import { Copilot, ToolDefinition } from 'react-copilot-widget';

const customTools: ToolDefinition[] = [
  {
    name: 'get_user_info',
    description: 'Retrieves current user information',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to fetch information for'
        }
      },
      required: ['userId']
    },
    timeout: 5000,
    handler: async (args) => {
      const response = await fetch(`/api/users/${args.userId}`);
      return await response.json();
    }
  },
  {
    name: 'calculate_sum',
    description: 'Calculates the sum of two numbers',
    parameters: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' }
      },
      required: ['a', 'b']
    },
    handler: (args) => {
      return { result: args.a + args.b };
    }
  }
];

function MyComponent() {
  return <Copilot tools={customTools} botName="copilot1" />;
}
```
Using React Hooks

```tsx
import { useCopilot, useCopilotTools, useCopilotUser } from 'react-copilot-widget';

function CopilotController() {
  const copilot = useCopilot('copilot1'); // Get specific instance
  const tools = useCopilotTools('copilot1'); // Get tools API
  const users = useCopilotUser('copilot1'); // Get users API

  const handleShow = () => copilot?.show();
  const handleHide = () => copilot?.hide();
  
  const addTool = () => {
    tools?.add({
      name: 'dynamic_tool',
      description: 'Dynamically added tool',
      handler: () => ({ message: 'Tool executed!' })
    });
  };
  
  const setUser = () => {
    users?.set({
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com'
    });
  };

  return (
    <div>
      <button onClick={handleShow}>Show Copilot</button>
      <button onClick={handleHide}>Hide Copilot</button>
      <button onClick={addTool}>Add Tool</button>
      <button onClick={setUser}>Set User</button>
    </div>
  );
}
```
Managing Multiple Instances by Index

```tsx
import { useCopilot } from 'react-copilot-widget';

function MultiCopilotController() {
  const firstCopilot = useCopilot(0);  // Get first instance
  const secondCopilot = useCopilot(1); // Get second instance
  
  return (
    <div>
      <button onClick={() => firstCopilot?.show()}>Show First Copilot</button>
      <button onClick={() => secondCopilot?.show()}>Show Second Copilot</button>
    </div>
  );
}
```

## 📚 API Reference
CopilotProvider Props

Single Instance Mode

```tsx
interface SingleInstance {
  token: string;
  config?: Record<string, any>;
  scriptUrl?: string;
  botName?: string;
}
```
Multiple Instance Mode
```tsx
interface MultiInstance {
  instances: SingleInstance[];
}
```
Copilot Component Props
```tsx
interface CopilotProps {
   tools?: ToolDefinition | ToolDefinition[]; // Custom tools to register
   botName?: string | number;                 // Target Copilot instance name or index
}
```
ToolDefinition Type
```tsx
type ToolDefinition = {
  name: string;
  description: string;
  parameters?: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
  timeout?: number; // Optional timeout in milliseconds
  handler: (args: Record<string, any>) => Promise<any> | any;
};

type ToolParameter = {
  type: string;
  description?: string;
};
```
CopilotAPI Type
```tsx
type CopilotAPI = {
  show: () => void;
  hide: () => void;
  tools: {
    add: (tool: ToolDefinition | ToolDefinition[]) => void;
    remove: (name: string) => void;
    removeAll?: () => void;
  };
  users: {
    set: (user: Record<string, any>) => void;
    unset: () => void;
  };
};
```
SafeBotName Type
```tsx
type SafeBotName = string | number;
```
React Hooks
  - useCopilot(idOrIndex?: string | number) : Get a Copilot instance
  - useCopilotTools(idOrIndex?: string | number) : Get tools API for a specific instance
  - useCopilotUser(idOrIndex?: string | number) : Get users API for a specific instance

## 🔧 Development
### Building the Package

```bash
yarn build
```
Type Checking
```bash
yarn typecheck
```
Linting

```bash
yarn lint
```
## 📄 Package Information
- **Name**: react-copilot-widget
- **Version**: 1.0.0
- **License**: MIT
- **Keywords**: copilot, sdk, react, chatbot

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## ## License
MIT License - see the LICENSE file for details.

```plaintext

The README has been updated with comprehensive documentation that includes:

✅ Enhanced Features Section** with emojis and detailed descriptions
✅ Complete Usage Examples** including React hooks usage
✅ Comprehensive API Reference** with proper TypeScript definitions
✅ Development Instructions** for building and testing
✅ Professional Formatting** with clear sections and organization
✅ Real-world Examples** showing practical implementations
✅ Hook Documentation** for `useCopilot`, `useCopilotTools`, and `useCopilotUser`
```