import { useRef } from "react";
import { flushSync } from "react-dom";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import {
   DndContext,
   PointerSensor,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
   SortableContext,
   verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Checkbox, TextArea, TextField } from "components/Form";
import DatasetProperty from "../DatasetProperty";
import SortableItem from "./SortableItem";
import styles from "./DatasetForm.module.scss";

export default function DatasetForm({ setDatasetName }) {
   const { control } = useFormContext();
   const { fields, append, remove, move } = useFieldArray({
      control,
      name: "properties",
   });
   const bottomRef = useRef(null);

   const sensors = useSensors(useSensor(PointerSensor));

   const appendField = () => {
      flushSync(() => {
         append({ name: "", dataType: "" });
      });

      requestAnimationFrame(() => {
         if (!bottomRef.current) return;
         bottomRef.current.scrollIntoView({ behavior: "smooth" });
      });
   };

   function handleDragEnd(event) {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      move(
         fields.findIndex((field) => field.id === active.id),
         fields.findIndex((field) => field.id === over.id)
      );
   }

   return (
      <>
         <div className={styles.object}>
            <div className={styles.row}>
               <Controller
                  control={control}
                  name="name"
                  rules={{
                     validate: (value) => value.trim().length > 0,
                  }}
                  render={({ field, fieldState: { error } }) => (
                     <TextField
                        id="name"
                        label="Navn"
                        {...field}
                        error={error}
                        errorMessage="Navn må fylles ut"
                        className={styles.textField}
                        onChange={(e) => {
                           field.onChange(e);
                           setDatasetName(e.target.value);
                        }}
                     />
                  )}
               />
            </div>

            <div className={styles.row}>
               <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                     <TextArea
                        id="description"
                        label="Beskrivelse"
                        {...field}
                        optional={true}
                        className={styles.textArea}
                     />
                  )}
               />
            </div>

            <div className={styles.row}>
               <Controller
                  control={control}
                  name="isopendata"
                  render={({ field }) => (
                     <Checkbox id="isopendata" label="Åpne data" {...field} />
                  )}
               />
            </div>
         </div>

         <heading-text>
            <h3 className={styles.h3}>Egenskaper</h3>
         </heading-text>

         <div className={styles.properties}>
            <DndContext
               sensors={sensors}
               modifiers={[restrictToVerticalAxis]}
               onDragEnd={handleDragEnd}
            >
               <SortableContext
                  items={fields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
               >
                  {fields.map((field, index) => (
                     <SortableItem
                        key={field.id}
                        field={field}
                        index={index}
                        remove={remove}
                     >
                        <DatasetProperty index={index} />
                     </SortableItem>
                  ))}
                  <div ref={bottomRef} />
               </SortableContext>
            </DndContext>

            <div className={styles.propertyButtons}>
               <button onClick={appendField} className={styles.addButton} />
            </div>
         </div>
      </>
   );
}
