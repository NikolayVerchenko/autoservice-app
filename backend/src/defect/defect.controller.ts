import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query } from '@nestjs/common';
import { ComplaintLabor } from './complaint-labor.entity';
import { ComplaintPart } from './complaint-part.entity';
import { DefectComplaint } from './defect-complaint.entity';
import { Defect } from './defect.entity';
import { DefectService } from './defect.service';
import { AddComplaintDto } from './dto/add-complaint.dto';
import { AssignMechanicDto } from './dto/assign-mechanic.dto';
import { CreateComplaintLaborDto } from './dto/create-complaint-labor.dto';
import { CreateComplaintPartDto } from './dto/create-complaint-part.dto';
import { CreateDefectDto } from './dto/create-defect.dto';
import { FindDefectsQueryDto } from './dto/find-defects-query.dto';
import { UpdateComplaintApprovalDto } from './dto/update-complaint-approval.dto';
import { UpdateComplaintLaborDto } from './dto/update-complaint-labor.dto';
import { UpdateComplaintPartDto } from './dto/update-complaint-part.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';

@Controller('defects')
export class DefectController {
  constructor(private readonly defectService: DefectService) {}

  @Post()
  create(@Body() dto: CreateDefectDto): Promise<Defect> {
    return this.defectService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindDefectsQueryDto): Promise<Defect[]> {
    return this.defectService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Defect> {
    return this.defectService.findOne(id);
  }

  @Post(':id/complaints')
  addComplaint(@Param('id') id: string, @Body() dto: AddComplaintDto): Promise<DefectComplaint> {
    return this.defectService.addComplaint(id, dto);
  }

  @Post(':id/assign-mechanic')
  assignMechanic(@Param('id') id: string, @Body() dto: AssignMechanicDto): Promise<Defect> {
    return this.defectService.assignMechanic(id, dto);
  }

  @Post(':id/send-to-client')
  sendToClient(@Param('id') id: string): Promise<{ ok: true }> {
    return this.defectService.sendDefectToClient(id);
  }
}

@Controller('public/defects')
export class PublicDefectController {
  constructor(private readonly defectService: DefectService) {}

  @Get(':id')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getPublicHtml(@Param('id') id: string, @Query('token') token?: string): Promise<string> {
    return this.defectService.getPublicDefectHtml(id, token);
  }
}

@Controller('complaints')
export class ComplaintController {
  constructor(private readonly defectService: DefectService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateComplaintDto): Promise<DefectComplaint> {
    return this.defectService.updateComplaint(id, dto);
  }

  @Patch(':id/approval')
  updateApproval(@Param('id') id: string, @Body() dto: UpdateComplaintApprovalDto): Promise<DefectComplaint> {
    return this.defectService.updateComplaintApproval(id, dto);
  }

  @Post(':id/labors')
  addLabor(@Param('id') id: string, @Body() dto: CreateComplaintLaborDto): Promise<ComplaintLabor> {
    return this.defectService.addLabor(id, dto);
  }

  @Post(':id/parts')
  addPart(@Param('id') id: string, @Body() dto: CreateComplaintPartDto): Promise<ComplaintPart> {
    return this.defectService.addPart(id, dto);
  }
}

@Controller('complaint-labors')
export class ComplaintLaborController {
  constructor(private readonly defectService: DefectService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateComplaintLaborDto): Promise<ComplaintLabor> {
    return this.defectService.updateLabor(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ deleted: true }> {
    return this.defectService.deleteLabor(id);
  }
}

@Controller('complaint-parts')
export class ComplaintPartController {
  constructor(private readonly defectService: DefectService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateComplaintPartDto): Promise<ComplaintPart> {
    return this.defectService.updatePart(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ deleted: true }> {
    return this.defectService.deletePart(id);
  }
}
