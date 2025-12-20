import { RiLink } from 'react-icons/ri';

export function HeaderAnchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      data-anchor={id}
      className="absolute -left-6 opacity-10 transition-opacity duration-200 hover:opacity-100"
      onClick={(e) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }}
    >
      <RiLink className="max-h-[.75em]" />
    </a>
  );
}
