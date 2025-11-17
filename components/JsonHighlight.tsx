interface JsonHighlightProps {
  data: any;
}

export default function JsonHighlight({ data }: JsonHighlightProps) {
  const formatJson = (obj: any, indent = 0): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const spaces = '  '.repeat(indent);

    if (obj === null) {
      elements.push(
        <span key={`null-${indent}`} className="json-null">null</span>
      );
      return elements;
    }

    if (typeof obj === 'boolean') {
      elements.push(
        <span key={`bool-${indent}`} className="json-boolean">{obj.toString()}</span>
      );
      return elements;
    }

    if (typeof obj === 'number') {
      elements.push(
        <span key={`num-${indent}`} className="json-number">{obj}</span>
      );
      return elements;
    }

    if (typeof obj === 'string') {
      elements.push(
        <span key={`str-${indent}`} className="json-string">&quot;{obj}&quot;</span>
      );
      return elements;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        elements.push(
          <span key={`arr-empty-${indent}`} className="json-punctuation">[]</span>
        );
        return elements;
      }

      elements.push(
        <span key={`arr-open-${indent}`} className="json-punctuation">[</span>,
        <br key={`arr-br1-${indent}`} />
      );

      obj.forEach((item, index) => {
        elements.push(
          <span key={`arr-space-${indent}-${index}`}>{spaces}  </span>
        );
        elements.push(...formatJson(item, indent + 1));
        if (index < obj.length - 1) {
          elements.push(
            <span key={`arr-comma-${indent}-${index}`} className="json-punctuation">,</span>
          );
        }
        elements.push(<br key={`arr-br-${indent}-${index}`} />);
      });

      elements.push(
        <span key={`arr-close-space-${indent}`}>{spaces}</span>,
        <span key={`arr-close-${indent}`} className="json-punctuation">]</span>
      );
      return elements;
    }

    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        elements.push(
          <span key={`obj-empty-${indent}`} className="json-punctuation">{'{}'}</span>
        );
        return elements;
      }

      elements.push(
        <span key={`obj-open-${indent}`} className="json-punctuation">{'{'}</span>,
        <br key={`obj-br1-${indent}`} />
      );

      keys.forEach((key, index) => {
        elements.push(
          <span key={`obj-space-${indent}-${index}`}>{spaces}  </span>,
          <span key={`obj-key-${indent}-${index}`} className="json-key">&quot;{key}&quot;</span>,
          <span key={`obj-colon-${indent}-${index}`} className="json-punctuation">: </span>
        );
        elements.push(...formatJson(obj[key], indent + 1));
        if (index < keys.length - 1) {
          elements.push(
            <span key={`obj-comma-${indent}-${index}`} className="json-punctuation">,</span>
          );
        }
        elements.push(<br key={`obj-br-${indent}-${index}`} />);
      });

      elements.push(
        <span key={`obj-close-space-${indent}`}>{spaces}</span>,
        <span key={`obj-close-${indent}`} className="json-punctuation">{'}'}</span>
      );
      return elements;
    }

    return elements;
  };

  return (
    <pre className="code-block">
      <code>{formatJson(data)}</code>
    </pre>
  );
}

