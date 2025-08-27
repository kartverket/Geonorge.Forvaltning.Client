import styles from "./RemoteEditor.module.scss";

export default function RemoteEditor({ editor, className }) {
   return (
      editor !== null && (
         <div className={className || styles.editor}>
            <div
               title={`Objektet redigeres av ${editor.username}`}
               style={{ backgroundColor: editor.color }}
            >
               {editor.username}
            </div>
         </div>
      )
   );
}
