# React Copilot Widget

A React component library for integrating the Copilot chat widget into your applications. This library provides a flexible and type-safe way to manage single or multiple Copilot instances with custom tools and user configurations.

## Features

- 🔄 **Multiple Mode Support**: Run single or multiple Copilot instances simultaneously
- 🛠 **Custom Tools Integration**: Easy registration and management of custom tools
- 👥 **User Management**: Set and manage user configurations
- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions
- ⚡ **Lightweight**: Minimal dependencies with only React as a peer dependency
- 🔌 **Easy Integration**: Simple React components for quick implementation

## Installation

```bash
npm install react-copilot-widget
# or
yarn add react-copilot-widget
```
## Usage guide
### Basic Setup

```typescript
import { CopilotProvider } from 'react-copilot-widget';

function App() {
  return (
    <CopilotProvider
      token="your-copilot-token"
      config={{
        // Your Copilot configuration
      }}
    >
      {/* Your app content */}
    </CopilotProvider>
  );
}
```
### Multiple Instances

```typescript
import { CopilotProvider, CopilotMode } from 'react-copilot-widget';

function App() {
  return (
    <CopilotProvider
      mode={CopilotMode.MULTI}
      instances={[
        {
          token: 'token-1',
          botName: 'copilot1',
          config: { /* config for first instance */ }
        },
        {
          token: 'token-2',
          botName: 'copilot2',
          config: { /* config for second instance */ }
        }
      ]}
    >
      {/* Your app content */}
    </CopilotProvider>
  );
}
```

### Adding Custom Tools

```typescript
import { Copilot } from 'react-copilot-widget';

const customTool = {
  name: 'custom_tool',
  description: 'A custom tool implementation',
  parameters: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'First parameter'
      }
    },
    required: ['param1']
  },
  handler: async (args) => {
    // Tool implementation
    return { result: 'Success' };
  }
};

function MyComponent() {
  return <Copilot tools={customTool} botName="copilot1" />;
}
```

### Managing Copilot Instances
```typescript
import { getCopilotInstance } from 'react-copilot-widget';

// Get a specific instance
const copilot = getCopilotInstance('copilot1');

// Show/hide the widget
copilot?.show();
copilot?.hide();

// Manage tools
copilot?.tools?.add(newTool);
copilot?.tools?.remove('tool_name');
copilot?.tools?.removeAll();

// Manage users
copilot?.users?.set({ id: 'user1', name: 'John Doe' });
copilot?.users?.unset();
```
## API Reference


### CopilotProvider Props
```
- mode : 'single' | 'multi' - Operation mode for Copilot instances
- token : string - Copilot API token (for single mode)
- config : object - Configuration options (for single mode)
- scriptUrl : string - Custom script URL (optional)
- botName : string - Custom instance name (optional)
- instances : array - Array of instance configurations (for multi mode)
```
### Copilot Component Props
```
- tools : ToolDefinition | ToolDefinition[] - Custom tools to register
- botName : string - Target Copilot instance name
```
### ToolDefinition

```typescript
type ToolDefinition = {
  name: string;
  description: string;
  parameters?: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
  timeout?: number;
  handler: (args: Record<string, any>) => Promise<any> | any;
};
```
### License
```
MIT
```