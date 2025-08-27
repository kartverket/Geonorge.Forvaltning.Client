import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SortableItem.module.scss";

export default function SortableItem({ field, index, remove, children }) {
   const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: field.id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
   };

   return (
      <div
         ref={setNodeRef}
         style={style}
         className={`${styles.property} ${
            isDragging && styles.draggingProperty
         }`}
      >
         <div className={styles.propertyButtons}>
            <button
               ref={setActivatorNodeRef}
               {...listeners}
               {...attributes}
               className={styles.dragButton}
            />
         </div>

         {children}

         <div className={styles.propertyButtons}>
            {field ? (
               <button
                  onClick={() => remove(index)}
                  className={styles.removeButton}
               />
            ) : null}
         </div>
      </div>
   );
}
