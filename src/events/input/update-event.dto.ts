import { PartialType } from "@nestjs/mapped-types";
import { CreateEventDto } from "./create-event.dto";

// partial type: all the properties get optional
export class UpdateEventDto extends PartialType(CreateEventDto) {

}